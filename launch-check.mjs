import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const root = new URL(".", import.meta.url).pathname;
const files = [];

function walk(dir) {
  for (const item of readdirSync(dir)) {
    const path = join(dir, item);
    if (statSync(path).isDirectory()) walk(path);
    else files.push(path);
  }
}

walk(root);

const htmlFiles = files.filter((file) => file.endsWith(".html"));
const required = ["privacy.html", "contact.html", "disclaimer.html", "robots.txt", "sitemap.xml", "ads.txt", "CNAME"];
const errors = [];

for (const name of required) {
  if (!files.some((file) => file.endsWith(name))) errors.push(`Missing ${name}`);
}

for (const file of htmlFiles) {
  const html = readFileSync(file, "utf8");
  const hrefs = [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map((match) => match[1]);
  for (const href of hrefs) {
    if (/^(https?:|mailto:|#|data:)/.test(href)) continue;
    const clean = href.split("#")[0].split("?")[0];
    if (!clean) continue;
    const target = join(root, clean);
    try {
      statSync(target);
    } catch {
      errors.push(`Broken local reference in ${file.replace(root, "")}: ${href}`);
    }
  }
}

const index = readFileSync(join(root, "index.html"), "utf8");
for (const key of ["canonical", "og:title", "twitter:card", "application/ld+json", "contentData"]) {
  if (!index.includes(key)) errors.push(`Missing SEO marker: ${key}`);
}

for (const marker of ["ops-section", "shareBrief", "sourceLog", "copyShareBrief", "copyRedeemGuide", "data-ad-slot-key", "FAQPage", "SoftwareApplication"]) {
  if (!index.includes(marker)) errors.push(`Missing homepage feature marker: ${marker}`);
}

const content = JSON.parse(readFileSync(join(root, "data/content.json"), "utf8"));
if (!content.codes.length) errors.push("No codes in content data");
if (!content.marketNotes.length) errors.push("No market notes in content data");
if (!content.sources?.length) errors.push("No sources in content data");
if (!content.updatedAt) errors.push("Missing updatedAt in content data");

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Launch check passed for ${htmlFiles.length} HTML files and ${files.length} total files.`);
