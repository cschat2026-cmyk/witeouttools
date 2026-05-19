import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const [publisherId, topSlot = "", toolsSlot = "", guidesSlot = ""] = process.argv.slice(2);

if (!publisherId || !/^ca-pub-\d{10,}$/.test(publisherId)) {
  console.error("Usage: node set-adsense.mjs ca-pub-1234567890123456 [top-slot] [tools-slot] [guides-slot]");
  process.exit(1);
}

const root = new URL(".", import.meta.url).pathname;
const appPath = join(root, "app.js");
const adsPath = join(root, "ads.txt");
const app = readFileSync(appPath, "utf8");
const publisherNumber = publisherId.replace("ca-pub-", "pub-");

const next = app
  .replace(/publisherId: "ca-pub-[^"]+"/, `publisherId: "${publisherId}"`)
  .replace(/top: "[^"]*"/, `top: "${topSlot}"`)
  .replace(/tools: "[^"]*"/, `tools: "${toolsSlot}"`)
  .replace(/guides: "[^"]*"/, `guides: "${guidesSlot}"`);

writeFileSync(appPath, next);
writeFileSync(adsPath, `google.com, ${publisherNumber}, DIRECT, f08c47fec0942fa0\n`);
console.log("AdSense config updated in app.js and ads.txt");
