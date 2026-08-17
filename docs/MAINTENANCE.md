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
| `src/content/posts/*.md` | 文章原檔。 |
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

腳本會建立 `src/content/posts/article-slug.md`，並寫入：

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

留言使用 giscus。設定在 `src/data/giscus.ts`，目前使用 `mapping: "pathname"`；修改已發布文章的檔名會改變網址，也會建立新的留言對應。

## 部署

原始碼放在 `main` 分支。推送後 GitHub Actions 會 build Fuwari，並透過 GitHub Pages artifact 發布網站。

```powershell
git pull --ff-only origin main
git add .
git commit -m "Update blog"
git push origin main
```

GitHub Pages 的發布來源設定為 `GitHub Actions`。`dist/` 不需要加入 Git，也不需要 personal access token。舊 `source` 分支只作為備份，不再用於日常維護或部署。
