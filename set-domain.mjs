import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const domain = process.argv[2];
if (!domain || !/^https:\/\/[a-z0-9.-]+\/?$/i.test(domain)) {
  console.error("Usage: node set-domain.mjs https://your-domain.com");
  process.exit(1);
}

const normalized = domain.replace(/\/$/, "");
const root = new URL(".", import.meta.url).pathname;
const files = ["index.html", "privacy.html", "contact.html", "disclaimer.html", "robots.txt", "sitemap.xml"];

for (const file of files) {
  const path = join(root, file);
  const next = readFileSync(path, "utf8").replaceAll("https://example.com", normalized);
  writeFileSync(path, next);
}

console.log(`Domain set to ${normalized}`);
