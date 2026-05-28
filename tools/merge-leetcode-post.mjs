import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cleanMarkdownPath = 'C:/Users/huiink/Downloads/LeetCode_完整刷題記錄.md';
const deployedHtmlPath = path.join(root, 'tools', 'program-post.html');
const targetPath = path.join(root, 'source', '_posts', '技藝競賽選手培訓期間刷題合集.md');

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

`;

function decodeHtml(value) {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

function textFromHtml(html) {
  return decodeHtml(html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/[ \t]+\n/g, '\n'))
    .trim();
}

function compactInlineHtml(html) {
  return decodeHtml(html
    .replace(/<br\s*\/?>/gi, '  \n')
    .replace(/<code>([\s\S]*?)<\/code>/gi, (_, code) => `\`${textFromHtml(code)}\``)
    .replace(/<strong>([\s\S]*?)<\/strong>/gi, (_, strong) => `**${textFromHtml(strong)}**`)
    .replace(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, (_, href, text) => `[${textFromHtml(text)}](${decodeHtml(href)})`)
    .replace(/<[^>]+>/g, '')
    .replace(/[ \t]+\n/g, '\n'))
    .trim();
}

function codeFromFigure(section) {
  const match = section.match(/<td class="code"><pre>([\s\S]*?)<\/pre><\/td>/);
  if (!match) return '';

  return decodeHtml(match[1]
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\n+$/g, ''));
}

function getAfterHeading(section, headingTitle) {
  const heading = new RegExp(`<h3\\b[^>]*title="${headingTitle}"[^>]*>[\\s\\S]*?<\\/h3>`, 'i');
  const headingMatch = section.match(heading);
  if (!headingMatch) return '';

  const afterHeading = section.slice(section.indexOf(headingMatch[0]) + headingMatch[0].length);
  const paragraphMatch = afterHeading.match(/<p>([\s\S]*?)<\/p>/i);
  return paragraphMatch ? compactInlineHtml(paragraphMatch[1]) : '';
}

function sectionToMarkdown(section) {
  const h2 = section.match(/<h2\b[\s\S]*?<\/h2>/i);
  if (!h2) return '';

  const titleMatch = h2[0].match(/title="([^"]+)"/);
  const title = titleMatch ? decodeHtml(titleMatch[1]) : textFromHtml(h2[0]);
  const afterH2 = section.slice(section.indexOf(h2[0]) + h2[0].length);
  const metaMatch = afterH2.match(/<p>([\s\S]*?)<\/p>/i);
  const meta = metaMatch ? compactInlineHtml(metaMatch[1]) : '';
  const question = getAfterHeading(section, '題目說明');
  const solution = getAfterHeading(section, '解題邏輯');
  const code = codeFromFigure(section);

  const blocks = [`## ${title}`];
  if (meta) blocks.push(meta);
  if (question) blocks.push(`### 題目說明\n${question}`);
  if (solution) blocks.push(`### 解題邏輯\n${solution}`);
  if (code) blocks.push(`\`\`\`python\n${code}\n\`\`\``);

  return `${blocks.join('\n\n')}\n\n---`;
}

function extractApcsSections(html) {
  const bodyStart = html.indexOf('<div class="e-content article-entry" itemprop="articleBody">');
  const body = bodyStart === -1 ? html : html.slice(bodyStart);
  const apcsStart = body.indexOf('<h2 id="c462-');

  if (apcsStart === -1) {
    throw new Error('Could not find detailed APCS sections in deployed HTML.');
  }

  const apcs = body.slice(apcsStart);
  return apcs
    .split(/(?=<h2\b)/g)
    .filter(section => /^<h2\b/.test(section))
    .map(sectionToMarkdown)
    .filter(Boolean)
    .join('\n\n');
}

let cleanMarkdown = fs.readFileSync(cleanMarkdownPath, 'utf8').replace(/\r\n/g, '\n');
cleanMarkdown = cleanMarkdown.replace(
  '> 共計 **116 題** + APCS 歷屆考題。',
  '> 總計 **LeetCode 116 題** + **APCS 歷屆考題 8 題**。'
);

const deployedHtml = fs.readFileSync(deployedHtmlPath, 'utf8');
const apcsSections = extractApcsSections(deployedHtml);
const apcsIndexHeading = '## APCS 考試連結索引';

if (!cleanMarkdown.includes(apcsIndexHeading)) {
  throw new Error('Could not find APCS index heading in clean Markdown.');
}

const mergedMarkdown = cleanMarkdown.replace(
  apcsIndexHeading,
  `${apcsSections}\n\n${apcsIndexHeading}`
);

fs.writeFileSync(targetPath, `${frontMatter}${mergedMarkdown.trim()}\n`, 'utf8');
console.log(`Merged clean LeetCode Markdown with APCS details into ${path.relative(root, targetPath)}`);
