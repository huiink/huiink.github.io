# huiink's blog

這是 [huiink.github.io](https://huiink.github.io/) 的原始碼。網站已從 Hexo / Vivia 遷移到 [Fuwari](https://github.com/saicaca/fuwari)，目前使用 Astro、Tailwind CSS、pnpm 和 GitHub Actions 部署。

## 快速開始

需要 Node.js 20 或 22，使用 pnpm 9.14.4。

```powershell
corepack enable
corepack prepare pnpm@9.14.4 --activate
pnpm install
pnpm dev
```

本地預覽預設在 `http://localhost:4321/`。

## 常用指令

| 指令 | 用途 |
| --- | --- |
| `pnpm dev` | 啟動本地開發伺服器 |
| `pnpm build` | 產生靜態網站到 `dist/` |
| `pnpm preview` | 預覽 `dist/` |
| `pnpm check` | 執行 Astro 檢查 |
| `pnpm new-post <文章檔名>` | 在文章目錄建立新文章 |

## 內容位置

| 路徑 | 用途 |
| --- | --- |
| `src/config.ts` | 網站標題、導覽列、頭像、社群連結 |
| `src/content/posts/*.md` | 文章 Markdown |
| `src/content/spec/about.md` | 關於頁內容 |
| `src/data/friends.md` | 友鏈清單 |
| `src/data/friends.ts` | 讀取 `friends.md` 的小型資料轉換器 |
| `src/data/giscus.ts` | giscus 留言設定 |
| `public/` | 會被原樣輸出的圖片與靜態檔案 |
| `.github/workflows/deploy.yml` | GitHub Pages 自動部署 |

## 新增文章

```powershell
pnpm new-post my-new-post
```

這會直接建立：

```text
src/content/posts/my-new-post.md
```

文章網址會是：

```text
/posts/my-new-post/
```

文章日期由 frontmatter 的 `published: YYYY-MM-DD` 決定，不影響檔案位置或網址。

## 新增友鏈

編輯 `src/data/friends.md`，在最後貼上：

```yml
- name: 名字
  url: 網址
  desc: 描述
  image: 頭像網址
```

友鏈頁網址是 `/friends/`。

## 部署

此 repo 使用 `main` 分支保存原始碼。推送到 `main` 後，GitHub Actions 會：

1. 使用 Astro 官方 Action 安裝 Node.js 22 與 pnpm 9.14.4
2. 執行 `pnpm build`
3. 將 `dist/` 上傳為 GitHub Pages artifact
4. 使用官方 Pages Action 發布網站

GitHub Pages 的發布來源設為 `GitHub Actions`。`dist/` 不會提交到 Git，也不需要 personal access token。舊 `source` 分支只保留為標準化前的原始碼備份，日常不需使用。
