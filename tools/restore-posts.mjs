import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const postsDir = path.join(root, 'source', '_posts');

function bodyAfterFrontMatter(sourcePath) {
  const text = fs.readFileSync(sourcePath, 'utf8').replace(/\r\n/g, '\n');
  const markers = [...text.matchAll(/^---\s*$/gm)];

  if (markers.length >= 4) {
    return text.slice(markers[3].index + markers[3][0].length).replace(/^\n+/, '');
  }

  if (markers.length >= 2 && markers[0].index === 0) {
    return text.slice(markers[1].index + markers[1][0].length).replace(/^\n+/, '');
  }

  return text;
}

function writePost({ source, target, frontMatter }) {
  const body = bodyAfterFrontMatter(path.join(root, source));
  const content = `---\n${frontMatter.trim()}\n---\n\n${body}`;
  fs.writeFileSync(path.join(postsDir, target), content, 'utf8');
}

const posts = [
  {
    source: '11401FhCTFWriteup.md',
    target: '11401FhCTFWriteup.md',
    frontMatter: `
title: 11401FhCTF Writeup
date: 2026-01-09 03:45:00
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
`
  },
  {
    source: 'THJCC 2026 writeup.md',
    target: 'THJCC2026Writeip.md',
    frontMatter: `
title: THJCC 2026 writeup
date: 2026-02-22 00:00:00
categories:
  - 競賽
  - CTF
tags:
  - writeup
  - note
  - CTF
  - web
photos:
  - /img/logo2.png
description: |-
  六十四座黃銅塔傾覆之夜 八十八個黎明醒轉之時
  以八分之一刃 刺穿十一翼的天使
  斬落第八道光
`
  },
  {
    source: '模型道德切除與智力修復之實作筆記.md',
    target: '模型拒絕行為表示消融與能力恢復.md',
    frontMatter: `
title: 模型拒絕行為表示消融與能力恢復之實作報告
date: 2026-02-28 00:00:00
categories:
  - Project
tags:
  - AI
  - note
  - project
description: |-
  深淵的未來 守護與誓約 不滅的浪漫
  五百五十二的空洞 難以忍受的
  哀痛 教會你愛的是
`
  },
  {
    source: 'pre-exam 2026 Writeup.md',
    target: 'pre-exam-2026-Writeup.md',
    frontMatter: `
title: pre-exam 2026 Writeup
date: 2026-05-18 03:45:00
categories:
  - 競賽
  - CTF
tags:
  - writeup
  - note
  - CTF
  - web
`
  }
];

fs.mkdirSync(postsDir, { recursive: true });
for (const post of posts) writePost(post);

console.log(`Restored ${posts.length} posts into ${path.relative(root, postsDir)}`);
