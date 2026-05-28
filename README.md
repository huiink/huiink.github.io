# huiink's blog source

Hexo source for `https://huiink.github.io/`.

## Repository layout

- `huiink/huiink-blog-source-`: Hexo source, posts, config, and maintenance scripts.
- `huiink/huiink.github.io`: generated GitHub Pages output only.
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

Work in this source repository:

```powershell
git add .
git commit -m "Update blog"
git push
```

Pushing to `main` runs GitHub Actions. The workflow builds Hexo and publishes the generated `public/` folder to `huiink/huiink.github.io`.

## First-time deployment token

Because the source repository deploys to a different repository, GitHub Actions needs a secret named `PAGES_DEPLOY_TOKEN`.

Create a fine-grained GitHub personal access token with access only to `huiink/huiink.github.io`, and give it:

- Repository permissions: `Contents` read and write.

Then add it here:

```text
huiink-blog-source- -> Settings -> Secrets and variables -> Actions -> New repository secret
Name: PAGES_DEPLOY_TOKEN
Value: your token
```

Before the secret exists, Actions will still build the site, but it will skip publishing.

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
