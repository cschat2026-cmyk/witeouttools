import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const read = (path) => readFileSync(join(root, path), "utf8");
const html = read("index.html");
const app = read("app.js");
const css = read("styles.css");
const cname = read("CNAME").trim();
const robots = read("robots.txt");
const sitemap = read("sitemap.xml");
const privacy = read("privacy.html");
const contact = read("contact.html");
const disclaimer = read("disclaimer.html");
const content = JSON.parse(read("data/content.json"));

const errors = [];
const requireText = (source, text, label) => {
  if (!source.includes(text)) errors.push(label);
};

if (cname !== "witheout20.top") errors.push("CNAME is not set to witheout20.top");
for (const [name, source] of [
  ["index.html", html],
  ["privacy.html", privacy],
  ["contact.html", contact],
  ["disclaimer.html", disclaimer],
  ["robots.txt", robots],
  ["sitemap.xml", sitemap]
]) {
  if (source.includes("https://example.com")) errors.push(`${name} still contains example.com`);
}

for (const url of [
  "https://witheout20.top/",
  "https://witheout20.top/privacy.html",
  "https://witheout20.top/contact.html",
  "https://witheout20.top/disclaimer.html"
]) {
  requireText(sitemap, `<loc>${url}</loc>`, `Missing sitemap URL: ${url}`);
}
requireText(robots, "Sitemap: https://witheout20.top/sitemap.xml", "robots.txt sitemap URL is not set to witheout20.top");

for (const id of [
  "stateAgeDays",
  "stateAgeCurrentLevel",
  "currentLevel",
  "targetLevel",
  "furnaceStart",
  "furnaceTarget",
  "gearStart",
  "charmStart",
  "targetShards",
  "refreshStatus"
]) {
  requireText(html, `id="${id}"`, `Missing control #${id}`);
}

for (const marker of [
  'data-ad-slot-key="top"',
  'data-ad-slot-key="tools"',
  'data-ad-slot-key="guides"',
  '"@type": "FAQPage"',
  '"@type": "SoftwareApplication"',
  'max-image-preview:large',
  'id="dailyCockpitBoard"',
  'id="resourceJourneyPanel"'
]) {
  requireText(html, marker, `Missing SEO/ad marker: ${marker}`);
}

for (const marker of [
  "MEMORY_KEY",
  "restoreUserMemory",
  "bindMemoryInputs",
  "updateMemoryStatus",
  "getLocalDateKey",
  "renderDailyTaskBoard",
  "refreshContentInBackground",
  "PLAYER_IDS_KEY",
  "TIMER_STATE_KEY",
  "restoreTimerState",
  "persistTimerState",
  "ADSENSE_CONFIG",
  "renderAdSlots",
  "adsbygoogle",
  "expiresAt && item.expiresAt < today",
  "syncResourceLabToPlanner",
  "applyStateAgePlan",
  "buildDecisionModel",
  "renderDecisionBoard",
  "getDailyLoopModel",
  "renderDailyCockpit",
  "bindDailyCockpitActions",
  "runDailyCockpitStep",
  "renderResourceJourneyPanel",
  "rerenderStateAgeLinkedViews",
  "refreshTimerLinkedViews"
]) {
  requireText(app, marker, `Missing app behavior marker: ${marker}`);
}

for (const marker of [
  "Mobile usability hardening",
  "grid-template-columns: repeat(5",
  "-webkit-text-fill-color: #061b2c",
  "resource-next-move",
  "memory-status",
  "player-id-chip",
  "refresh-policy",
  "ad-placeholder",
  ".adsbygoogle",
  ".state-age-card-primary .tag",
  ".decision-section",
  ".decision-mini-grid",
  ".daily-cockpit-section",
  ".daily-cockpit-board",
  ".daily-cockpit-insights",
  ".resource-journey-panel",
  ".resource-journey-grid"
]) {
  requireText(css, marker, `Missing CSS marker: ${marker}`);
}

if ((content.resourceDataLab?.furnaceRows || []).length < 45) errors.push("Furnace route data is too thin");
if ((content.resourceDataLab?.chiefGearRows || []).length < 40) errors.push("Chief Gear data is too thin");
if ((content.resourceDataLab?.chiefCharmRows || []).length < 14) errors.push("Chief Charm data is too thin");
if ((content.resourceDataLab?.smartPresets || []).length < 4) errors.push("Missing smart resource presets");
if ((content.resourceDataLab?.resourceNeedMap || []).length < 5) errors.push("Missing resource need map");
if ((content.eventSpendMap || []).length < 3) errors.push("Missing event spend map breadth");
if ((content.eventDayPlans || []).length < 2) errors.push("Missing event day plans");
if ((content.sources || []).length < 8) errors.push("Source list should include code and resource references");

const today = new Date().toISOString().slice(0, 10);
for (const code of content.codes || []) {
  if (code.status === "active" && code.expiresAt && code.expiresAt < today) {
    errors.push(`Expired code still marked active: ${code.code}`);
  }
  if (!code.sourceLevel) errors.push(`Code missing sourceLevel: ${code.code}`);
}

const embedded = html.match(/<script id="contentData" type="application\/json">([\s\S]*?)<\/script>/);
if (!embedded) errors.push("Missing embedded contentData");
else {
  const embeddedData = JSON.parse(embedded[1]);
  if (embeddedData.updatedAt !== content.updatedAt) errors.push("Embedded contentData is not synced");
  if ((embeddedData.sources || []).length !== (content.sources || []).length) errors.push("Embedded source list differs from data/content.json");
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log("Site audit passed: storage, mobile markers, update policy, source coverage, and resource data are present.");
