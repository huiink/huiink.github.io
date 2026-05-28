# huiink's blog source

Hexo source for `https://huiink.github.io/`.

## Repository layout

This project uses one GitHub repository:

- `huiink/huiink.github.io` `source` branch: Hexo source, posts, config, and maintenance scripts.
- `huiink/huiink.github.io` `main` branch: generated GitHub Pages output.
- `huiink/huiink-comments`: giscus comments and discussions.

## Local maintenance

Use `npm.cmd` on Windows PowerShell if `npm` is blocked by the execution policy.

```powershell
npm.cmd install
npm.cmd run build
npm.cmd run preview
```

Open `http://localhost:4000/` after the preview server starts.

More detailed maintenance notes are in `docs/MAINTENANCE.md`.

## Normal update flow

Work on the `source` branch:

```powershell
git add .
git commit -m "Update blog"
git push
```

Pushing to `source` runs GitHub Actions. The workflow builds Hexo and publishes the generated `public/` folder to the `main` branch in the same repository.

No personal access token is required for this single-repository deployment.

## Friends

Friend links are listed in `source/_data/friends.md`:

```yml
- name: 名字
  url: 網址
  desc: 描述
  image: 頭像網址
```

## Comments

Comments are powered by giscus through `huiink/huiink-comments`. Configuration lives in `source/_data/giscus.json`; the integration hook is `scripts/giscus.js`.

## Recovery helper

The original root-level Markdown files were copied into Hexo posts with:

```powershell
npm.cmd run restore-posts
```

Only run that again if you intentionally want to regenerate `source/_posts` from the root Markdown backups.
