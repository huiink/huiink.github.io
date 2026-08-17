# Fuwari 標準化設計

日期：2026-08-18

## 背景

目前專案雖已使用 Astro 與 Fuwari，但為了保留舊 Hexo 網址，另外加入了日期分層文章目錄、自訂日期路由，以及 `source` 原始碼分支發布到 `main` 產物分支的流程。這些相容層讓日常新增文章與在 GitHub 查找 Markdown 變得不直觀。

審查流程已結束，因此專案將回到一般 Fuwari 使用方式。舊日期網址不保留，也不建立轉址。

## 目標

- `main` 成為唯一的日常開發分支，直接保存 Astro/Fuwari 原始碼與 Markdown。
- 文章直接放在 `src/content/posts/`，不再依年月日建立多層資料夾。
- 文章使用 Fuwari 標準網址 `/posts/<slug>/`。
- 推送 `main` 後，由 GitHub Actions 自動建置並部署 GitHub Pages。
- `dist/` 僅作為部署產物，不提交至 Git。
- 保留現有文章、圖片、網站設定、About、友鏈與 Giscus 功能。
- 保留目前遠端 `source` 分支作為原始碼備份。

## 不在範圍內

- 不保留或轉址 `/YYYY/MM/DD/<slug>/` 舊網址。
- 不遷移舊網址對應的 Giscus 討論串。Giscus 使用 `pathname`，新網址將建立新的留言對應。
- 不重新設計 Fuwari 視覺介面。
- 不從最新版 Fuwari 重新產生整個專案；只移除現有專案的過渡相容層。
- 不保留目前 `main` 上由 `dist/` 產生的靜態檔案歷史。

## 分支與備份

遠端 `source` 分支保留在已驗證的提交 `862fbe0`，不刪除也不覆寫，作為標準化前的完整原始碼備份。既有本機 `hexo-backup-20260801` 分支繼續保留更早的 Hexo 原檔。

標準化完成並通過本機驗證後，以目前原始碼歷史建立新的 `main`。由於遠端 `main` 現在是部署工具建立的產物分支，切換時需要使用受保護的 `--force-with-lease` 更新；執行前必須再次確認遠端 `source` 仍指向備份提交。

切換後：

- `main`：唯一的開發與部署觸發分支。
- `source`：只讀備份，不再作為部署來源。
- GitHub Pages：來源設定為 GitHub Actions，不直接讀取任何分支資料夾。

## 文章結構與網址

五篇既有文章從日期目錄移至：

```text
src/content/posts/<filename>.md
```

文章檔名保持不變，以降低內容變更範圍。Fuwari 的標準文章頁路由恢復為：

```text
src/pages/posts/[...slug].astro
```

網址產生函式恢復為 `/posts/<slug>/`。日期只由 frontmatter 的 `published: YYYY-MM-DD` 決定，不再影響檔案位置或網址。

`scripts/new-post.js` 恢復成直接在 `src/content/posts/` 建立 Markdown。日常新增文章為：

```powershell
pnpm new-post article-slug
```

## 保留的客製功能

- `src/config.ts` 的站名、頭像、橫幅、導覽與社群連結。
- `public/` 中的既有圖片與 favicon。
- `src/content/spec/about.md`。
- `src/data/friends.md`、友鏈解析器與 `/friends/` 頁面。
- Giscus 元件與 `src/data/giscus.ts` 設定。
- 多行 description、搜尋、RSS、Atom 與 Archive 相容入口。

這些功能不影響一般 Fuwari 新增文章流程，因此繼續保留。

## GitHub Pages 部署

工作流程改為在推送 `main` 時執行，採用 Astro 與 GitHub Pages 官方 artifact 部署模式：

1. Checkout `main` 原始碼。
2. 依 `pnpm-lock.yaml` 安裝套件。
3. 執行專案建置，產生 `dist/` 與 Pagefind 索引。
4. 上傳 `dist/` 為 GitHub Pages artifact。
5. 使用 `actions/deploy-pages` 發布 artifact。

工作流程不再向 `main` 或其他分支提交產物，也不需要 Personal Access Token。

## 日常維護流程

```powershell
git pull --ff-only origin main
pnpm install
pnpm new-post article-slug
pnpm dev
pnpm check
pnpm build
git add .
git commit -m "Add article"
git push origin main
```

推送後 GitHub Actions 自動部署。後續人員只需要理解一個分支、一個文章目錄與標準 Fuwari 指令。

## 驗證

本機驗證：

- `pnpm check` 無錯誤與警告。
- `pnpm build` 成功，Pagefind 索引成功建立。
- 所有文章輸出至 `/posts/<slug>/`。
- 首頁、文章、About、Archive、Friends、RSS 與 Atom 都能產生。
- 文章日期與 frontmatter 相同，不受執行環境時區影響。
- Giscus 元件能在新文章網址載入。

部署驗證：

- 推送 `main` 後官方 Pages workflow 成功。
- `https://huiink.github.io/` 回應成功並顯示 Fuwari。
- 友鏈與五篇文章可由新網址開啟。
- 遠端 `source` 仍停在備份提交 `862fbe0`。

## 失敗與復原

若本機建置失敗，不更新遠端 `main`。若首次 Pages workflow 失敗，修正工作流程後重新推送；標準化前原始碼仍可從遠端 `source` 取得。若需要完整退回目前版本，可從 `source` 建立新的工作分支並重新部署。

## 完成條件

- GitHub 預設分支為 `main`，且首頁直接顯示 Astro/Fuwari 原始碼。
- Markdown 可直接在 `src/content/posts/` 找到。
- 日常新增文章不建立日期資料夾。
- GitHub Pages 由 Actions artifact 部署，沒有產物分支寫入步驟。
- 網站、文章、友鏈與留言元件通過本機及線上驗證。
- `source` 原始碼備份保持可用。
