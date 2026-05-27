import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const [publisherId, topSlot = "", toolsSlot = "", guidesSlot = ""] = process.argv.slice(2);

if (!publisherId || !/^ca-pub-\d{10,}$/.test(publisherId)) {
  console.error("Usage: node set-adsense.mjs ca-pub-1234567890123456 [top-slot] [tools-slot] [guides-slot]");
  process.exit(1);
}

const root = new URL(".", import.meta.url).pathname;
const appPath = join(root, "app.js");
const indexPath = join(root, "index.html");
const adsPath = join(root, "ads.txt");
const app = readFileSync(appPath, "utf8");
const index = readFileSync(indexPath, "utf8");
const publisherNumber = publisherId.replace("ca-pub-", "pub-");

const nextApp = app
  .replace(/publisherId: "ca-pub-[^"]+"/, `publisherId: "${publisherId}"`)
  .replace(/top: "[^"]*"/, `top: "${topSlot}"`)
  .replace(/tools: "[^"]*"/, `tools: "${toolsSlot}"`)
  .replace(/guides: "[^"]*"/, `guides: "${guidesSlot}"`);

const nextIndex = index
  .replace(/provider: "(?:adsense|ezoic)"/, 'provider: "adsense"')
  .replace(/enabled: (?:true|false),\s*\n\s*siteId:/, 'enabled: false,\n          siteId:')
  .replace(/publisherId: "ca-pub-[^"]+"/, `publisherId: "${publisherId}"`)
  .replace(/top: "[^"]*"/, `top: "${topSlot}"`)
  .replace(/tools: "[^"]*"/, `tools: "${toolsSlot}"`)
  .replace(/guides: "[^"]*"/, `guides: "${guidesSlot}"`);

writeFileSync(appPath, nextApp);
writeFileSync(indexPath, nextIndex);
writeFileSync(adsPath, `google.com, ${publisherNumber}, DIRECT, f08c47fec0942fa0\n# Add your Ezoic entry after Ezoic assigns it in the dashboard.\n# Example format only:\n# ezoic.com, YOUR_EZOIC_ID, DIRECT\n`);
console.log("AdSense config updated in app.js, index.html, and ads.txt");
