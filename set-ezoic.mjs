import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const [siteId = "", verificationMeta = "", topPlacement = "", toolsPlacement = "", guidesPlacement = ""] = process.argv.slice(2);

if (!siteId && !verificationMeta && !topPlacement && !toolsPlacement && !guidesPlacement) {
  console.error("Usage: node set-ezoic.mjs SITE_ID VERIFICATION_META [top-placement] [tools-placement] [guides-placement]");
  process.exit(1);
}

const root = new URL(".", import.meta.url).pathname;
const appPath = join(root, "app.js");
const indexPath = join(root, "index.html");
const app = readFileSync(appPath, "utf8");
const index = readFileSync(indexPath, "utf8");

const replaceEzoic = (source) => source
  .replace(/provider: "(?:adsense|ezoic)"/, 'provider: "ezoic"')
  .replace(/enabled: (?:true|false),\s*\n\s*siteId:/, 'enabled: true,\n          siteId:')
  .replace(/siteId: "[^"]*"/, `siteId: "${siteId}"`)
  .replace(/verificationMeta: "[^"]*"/, `verificationMeta: "${verificationMeta}"`)
  .replace(/top: "[^"]*"/, `top: "${topPlacement}"`)
  .replace(/tools: "[^"]*"/, `tools: "${toolsPlacement}"`)
  .replace(/guides: "[^"]*"/, `guides: "${guidesPlacement}"`);

writeFileSync(appPath, replaceEzoic(app));
writeFileSync(indexPath, replaceEzoic(index));
console.log("Ezoic config updated in app.js and index.html");
