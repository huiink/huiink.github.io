# huiink's blog

Hexo source for `https://huiink.github.io/`.

## Local maintenance

```bash
npm install
npm run build
npm run preview
```

Posts live in `source/_posts/`. Static assets that should be copied into the generated site live under `source/`.

More detailed maintenance notes are in `docs/MAINTENANCE.md`.

## Deployment flow

Use the `source` branch for this source project. GitHub Actions builds Hexo on every push to `source`, then publishes the generated `public/` folder to the `main` branch used by GitHub Pages.

```bash
git init -b source
git add .
git commit -m "Restore Hexo source"
git remote add origin https://github.com/huiink/huiink.github.io.git
git push -u origin source
```

After that, normal updates are:

```bash
git add .
git commit -m "Update blog"
git push
```

## Comments

Comments are powered by giscus through `huiink/huiink-comments`. Configuration lives in `source/_data/giscus.json`; the integration hook is `scripts/giscus.js`.

## Friends

Friend links are listed in `source/_data/friends.md`:

```yml
- name: 名字
  url: 網址
  desc: 描述
  image: 頭像網址
```

## Recovery helper

The original root-level Markdown files were copied into Hexo posts with:

```bash
npm run restore-posts
```

Only run that again if you intentionally want to regenerate `source/_posts` from the root Markdown backups.
