import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const indexPath = join(root, "index.html");
const dataPath = join(root, "data", "content.json");

const data = readFileSync(dataPath, "utf8").trim().replace(/<\//g, "<\\/");
const html = readFileSync(indexPath, "utf8");
const script = `    <script id="contentData" type="application/json">${data}</script>\n`;

const next = html.replace(/    <script id="contentData" type="application\/json">[\s\S]*?<\/script>\n/, script);
writeFileSync(indexPath, next);
console.log("Embedded content synced into index.html");
