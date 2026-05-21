import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const indexPath = join(root, "index.html");
const dataPath = join(root, "data", "content.json");

const data = readFileSync(dataPath, "utf8").trim().replace(/<\//g, "<\\/");
const html = readFileSync(indexPath, "utf8");
const script = `    <script id="contentData" type="application/json">${data}</script>\n`;

const pattern = /(^|\n)\s*<script id="contentData" type="application\/json">[\s\S]*?<\/script>\s*\n/;
if (!pattern.test(html)) {
  throw new Error("Could not locate embedded contentData script in index.html");
}

const next = html.replace(pattern, `\n${script}`);
if (next === html) {
  throw new Error("Embedded contentData script was found but not updated");
}

writeFileSync(indexPath, next);
console.log("Embedded content synced into index.html");
