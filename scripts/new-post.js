/* Create a dated post file that keeps URLs stable as /YYYY/MM/DD/slug/. */

import fs from "node:fs";
import path from "node:path";

function getDate() {
	const today = new Date();
	const year = String(today.getFullYear());
	const month = String(today.getMonth() + 1).padStart(2, "0");
	const day = String(today.getDate()).padStart(2, "0");

	return { year, month, day, published: `${year}-${month}-${day}` };
}

function stripMarkdownExtension(fileName) {
	return fileName.replace(/\.(md|mdx)$/i, "");
}

function toSafeFileName(fileName) {
	return stripMarkdownExtension(fileName)
		.trim()
		.replace(/[\\/:*?"<>|]/g, "-")
		.replace(/\s+/g, "-");
}

const args = process.argv.slice(2);

if (args.length === 0) {
	console.error(`Error: No filename argument provided
Usage: pnpm new-post <filename>`);
	process.exit(1);
}

const title = stripMarkdownExtension(args.join(" "));
const fileName = `${toSafeFileName(args.join(" "))}.md`;
const { year, month, day, published } = getDate();
const targetDir = path.join("src", "content", "posts", year, month, day);
const fullPath = path.join(targetDir, fileName);

if (fs.existsSync(fullPath)) {
	console.error(`Error: File ${fullPath} already exists`);
	process.exit(1);
}

if (!fs.existsSync(targetDir)) {
	fs.mkdirSync(targetDir, { recursive: true });
}

const content = `---
title: ${JSON.stringify(title)}
published: ${published}
description: ''
image: ''
tags: []
category: ''
draft: false
lang: ''
---
`;

fs.writeFileSync(fullPath, content);

console.log(`Post ${fullPath} created`);
