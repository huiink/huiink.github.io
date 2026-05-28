import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const input = path.join(root, 'tools', 'program-post.html');
const output = path.join(root, 'source', '_posts', '技藝競賽選手培訓期間刷題合集.md');

const html = fs.readFileSync(input, 'utf8');
const startMarker = '<div class="e-content article-entry" itemprop="articleBody">';
const start = html.indexOf(startMarker);

if (start === -1) {
  throw new Error('Could not find deployed article body.');
}

let body = html.slice(start + startMarker.length);
const commentStart = body.indexOf('<div id="comment-card"');

if (commentStart !== -1) {
  body = body.slice(0, commentStart);
}

body = body.trim();

const frontMatter = `---
title: 技藝競賽選手培訓期間刷題合集
date: 2025-06-21 00:00:00
categories:
  - Program
tags:
  - Program
  - note
  - python
photos:
  - /img/LeetCode_logo_rvs.png
description: |-
  散落於塵埃的軌跡 消逝的制約
  死於第一百九十八次的重生
  無聲的咆哮 束縛 破碎無冕的王冠
---

<!-- Recovered from the deployed GitHub Pages HTML because the original Markdown was not present locally. -->

`;

fs.writeFileSync(output, `${frontMatter}${body}\n`, 'utf8');
console.log(`Recovered deployed Program post to ${path.relative(root, output)}`);
