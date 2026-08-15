# Blog Maintenance

## 本地確認

```powershell
corepack enable
corepack prepare pnpm@9.14.4 --activate
pnpm install
pnpm dev
```

打開 `http://localhost:4321/`。如果 4321 被占用：

```powershell
pnpm dev -- --port 4322
```

正式輸出檢查：

```powershell
pnpm build
pnpm preview
```

## 目錄分工

| Path | Purpose |
| --- | --- |
| `src/config.ts` | 網站設定、導覽列、個人資訊、社群連結。 |
| `src/content/posts/YYYY/MM/DD/*.md` | 文章原檔。資料夾日期就是文章 URL 日期。 |
| `src/content/spec/about.md` | About 頁 Markdown 內容。 |
| `src/data/friends.md` | 友鏈資料。 |
| `src/data/friends.ts` | 將 `friends.md` 轉成頁面可用資料。 |
| `src/data/giscus.ts` | giscus 留言設定。 |
| `src/pages/friends.astro` | 友鏈頁版面。 |
| `src/components/GiscusComments.astro` | 留言元件。 |
| `public/` | favicon、頭像、封面、文章圖片等靜態檔。 |
| `.github/workflows/deploy.yml` | GitHub Actions 部署流程。 |

## 新增文章

```powershell
pnpm new-post article-slug
```

腳本會建立 `src/content/posts/YYYY/MM/DD/article-slug.md`，並寫入：

```md
---
title: "article-slug"
published: YYYY-MM-DD
description: ''
image: ''
tags: []
category: ''
draft: false
lang: ''
---
```

多行描述可以這樣寫：

```yml
description: |-
  第一行
  第二行
```

## 新增友鏈

編輯 `src/data/friends.md`，格式如下：

```yml
- name: 名字
  url: 網址
  desc: 描述
  image: 頭像網址
```

修改後執行：

```powershell
pnpm build
```

## 留言

留言使用 giscus。設定在 `src/data/giscus.ts`，目前使用 `mapping: "pathname"`，所以保留舊網址後，GitHub Discussions 的留言對應也會跟著穩定。

## 部署

原始碼放在 `source` 分支。推送後 GitHub Actions 會 build Fuwari，並把 `dist/` 發布到 `main` 分支。

```powershell
git add .
git commit -m "Update blog"
git push origin source
```

GitHub Pages 設定使用 `main` 分支。這種同 repo 部署不需要 personal access token。
