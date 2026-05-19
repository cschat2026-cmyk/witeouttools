import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const dataPath = join(root, "data", "content.json");

const RELIABLE_SOURCES = [
  {
    name: "Whiteout Survival official channels",
    type: "official",
    url: "https://www.whiteoutsurvival.com/"
  },
  {
    name: "Whiteout Survival Wiki gift code list",
    type: "official-wiki",
    url: "https://www.whiteoutsurvival.wiki/giftcodes/"
  },
  {
    name: "GamesRadar code checks",
    type: "editorial",
    url: "https://www.gamesradar.com/games/survival/whiteout-survival-codes-gift/"
  },
  {
    name: "Whiteout Survival Wiki Fire Crystal Furnace",
    type: "official-wiki",
    url: "https://www.whiteoutsurvival.wiki/buildings/fire-crystal-furnace/"
  },
  {
    name: "WOSC Fire Crystal Furnace database",
    type: "community-database",
    url: "https://www.whiteoutsurvival-community.com/tools/database/building/fire-crystal-furnace.html"
  },
  {
    name: "WhiteoutData Chief Gear",
    type: "community-database",
    url: "https://whiteoutdata.com/items/chief-gear/"
  },
  {
    name: "WhiteoutData Chief Charms",
    type: "community-database",
    url: "https://whiteoutdata.com/items/chief-charms/"
  },
  {
    name: "Whiteout Survival Wiki War Academy",
    type: "official-wiki",
    url: "https://www.whiteoutsurvival.wiki/buildings/war-academy/"
  }
];

const KNOWN_CODES = [
  {
    code: "WOSFAMILY26",
    region: "Global",
    expiresAt: "2026-05-20",
    rewards: ["1K Gems", "8x 1h Training Speedup", "2x 100 VIP XP", "10x 5m General Speedup"],
    sourceLevel: "official+editorial",
    activeWhenSeen: true,
    note: {
      en: "Confirmed active by the official wiki and GamesRadar on May 15, 2026. Expires May 20, 2026.",
      "zh-CN": "2026 年 5 月 15 日官方 Wiki 与 GamesRadar 均确认可用，已标注 2026 年 5 月 20 日到期。",
      "zh-TW": "2026 年 5 月 15 日官方 Wiki 與 GamesRadar 均確認可用，已標註 2026 年 5 月 20 日到期。"
    }
  },
  {
    code: "gogoWOS",
    region: "Global",
    rewards: ["500 Gems", "10K Hero XP", "2x Gold Keys", "20x 5m General Speedup"],
    sourceLevel: "official+editorial",
    activeWhenSeen: true,
    note: {
      en: "Still listed as active by the official wiki and GamesRadar on May 15, 2026.",
      "zh-CN": "截至 2026 年 5 月 15 日，官方 Wiki 与 GamesRadar 仍列为可用。",
      "zh-TW": "截至 2026 年 5 月 15 日，官方 Wiki 與 GamesRadar 仍列為可用。"
    }
  },
  {
    code: "LoveMom2026",
    region: "Global",
    rewards: ["1K Gems", "2x Gold Keys", "20x 5m General Speedup"],
    sourceLevel: "editorial",
    activeWhenSeen: false,
    note: {
      en: "Marked expired by GamesRadar on May 15, 2026. Keep only for history so players do not repost it as active.",
      "zh-CN": "GamesRadar 于 2026 年 5 月 15 日标为过期，仅保留作历史记录，避免再转发为可用码。",
      "zh-TW": "GamesRadar 於 2026 年 5 月 15 日標為過期，僅保留作歷史記錄，避免再轉發為可用碼。"
    }
  },
  {
    code: "FE5BY8",
    region: "Global",
    rewards: ["1K Gems", "50K Hero XP", "3x 1h Training Speedup"],
    sourceLevel: "editorial",
    activeWhenSeen: false,
    note: {
      en: "Listed as expired by GamesRadar on May 15, 2026. Required Furnace Lv. 9 while active.",
      "zh-CN": "GamesRadar 于 2026 年 5 月 15 日列为过期，生效时要求熔炉 9 级。",
      "zh-TW": "GamesRadar 於 2026 年 5 月 15 日列為過期，生效時要求熔爐 9 級。"
    }
  },
  {
    code: "ChildrensDay505",
    region: "Global",
    rewards: ["1K Gems", "8x 1h Training Speedup", "10x 5m General Speedup"],
    sourceLevel: "editorial",
    activeWhenSeen: false,
    note: {
      en: "Now listed as expired by GamesRadar on May 15, 2026.",
      "zh-CN": "GamesRadar 于 2026 年 5 月 15 日已列为过期。",
      "zh-TW": "GamesRadar 於 2026 年 5 月 15 日已列為過期。"
    }
  }
];

function deriveStatus(code, today) {
  if (code.activeWhenSeen && (!code.expiresAt || code.expiresAt >= today)) return "active";
  return "expired";
}

function extractPotentialCodes(html) {
  return [...new Set((html.match(/\b[A-Z0-9][A-Z0-9_-]{4,24}\b/g) || [])
    .filter((value) => /[A-Z]/.test(value) && /\d/.test(value))
    .filter((value) => !/^(HTML|JSON|HTTP|HTTPS|UTF|202\d|100K|10K|500K|1000K)$/i.test(value)))];
}

async function fetchSourceCodes(source) {
  try {
    const response = await fetch(source.url, {
      headers: {
        "user-agent": "whiteout-survival-tools/1.0 content refresh"
      }
    });
    if (!response.ok) return [];
    return extractPotentialCodes(await response.text());
  } catch {
    return [];
  }
}

function mergeFetchedStatus(codes, fetchedActiveCodes, today) {
  const seen = new Set(fetchedActiveCodes.map((code) => code.toUpperCase()));
  return codes.map((item) => {
    const baseStatus = deriveStatus(item, today);
    if (baseStatus === "expired") return { ...item, status: "expired" };
    if (seen.size && seen.has(item.code.toUpperCase())) return { ...item, status: "active" };
    return { ...item, status: seen.size ? "check" : baseStatus };
  });
}

const content = JSON.parse(readFileSync(dataPath, "utf8"));
const today = new Date().toISOString().slice(0, 10);
const fetchedCodeLists = await Promise.all(RELIABLE_SOURCES
  .filter((source) => /gift|code/i.test(source.name + " " + source.url))
  .map(fetchSourceCodes));
const fetchedCodes = [...new Set(fetchedCodeLists.flat())];

content.updatedAt = new Date().toISOString();
content.sources = RELIABLE_SOURCES;
content.codes = mergeFetchedStatus(KNOWN_CODES, fetchedCodes, today).sort((a, b) => {
  const order = { active: 0, official: 1, check: 2, expired: 3 };
  return (order[a.status] ?? 9) - (order[b.status] ?? 9);
});

writeFileSync(dataPath, JSON.stringify(content, null, 2) + "\n");
console.log(`Updated content.json with ${content.codes.length} filtered codes at ${content.updatedAt}`);
console.log(`Fetched ${fetchedCodes.length} candidate codes from reliable public references; conservative fallback used when fetch is unavailable.`);
