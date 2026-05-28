# Blog Maintenance

## Common Commands

```powershell
npm.cmd install
npm.cmd run build
npm.cmd run preview
```

Open `http://localhost:4000/` after the preview server starts.

If port 4000 is already used:

```powershell
npm.cmd run preview -- --port 4001
```

## Directory Map

| Path | Purpose |
| --- | --- |
| `source/_posts/` | Blog posts. Add or edit article Markdown here. |
| `source/about/index.md` | About page content. |
| `source/friends/index.md` | Friends page structure. Usually does not need edits. |
| `source/_data/friends.md` | Friends list. Paste new friends here. |
| `source/_data/giscus.json` | Giscus comment configuration. |
| `source/css/custom/friends.css` | Friends page card styling. |
| `scripts/` | Hexo build hooks. |
| `scripts/lib/` | Small shared helper modules used by build hooks. |
| `scripts/description-breaks.js` | Restores line breaks in Vivia home-card descriptions. |
| `tools/` | One-off recovery and migration helpers. |
| `.github/workflows/deploy.yml` | GitHub Actions deployment workflow. |

## Add A Friend

Edit `source/_data/friends.md` and append:

```yml
- name: 名字
  url: 網址
  desc: 描述
  image: 頭像網址
```

Then run:

```powershell
npm.cmd run build
```

## Add A Post

Create a Markdown file in `source/_posts/` with front matter:

```md
---
title: 文章標題
date: 2026-05-28 12:00:00
categories:
  - 分類
tags:
  - tag
---

文章內容
```

Multi-line `description` values are supported and will appear with line breaks on Vivia article cards:

```yml
description: |-
  第一行
  第二行
  第三行
```

## Comments

Comments are powered by giscus. To change the repository or category, edit `source/_data/giscus.json`.

Set `comments: false` in a post or page front matter to disable comments on that page.

## Deployment

This source lives in `huiink/huiink.github.io` on the `source` branch. Pushes to `source` trigger GitHub Actions.

The workflow builds Hexo and publishes `public/` to the `main` branch of the same repository, which is the GitHub Pages branch.

The workflow sets `TZ: Asia/Taipei` so date-only post front matter generates the same permalink date locally and on GitHub Actions.

No personal access token is required for this single-repository deployment.
