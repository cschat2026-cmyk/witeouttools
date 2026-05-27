# Whiteout Survival Tools

Static fan utility site for Whiteout Survival players.

## Why this game

Shortlist:

- Whiteout Survival: recommended. Large global strategy audience, recurring seasonal/events loop, strong demand for codes, upgrade planning, event checklists, and alliance coordination.
- Last War: Survival: strong revenue and broad reach, but the SEO product is more crowded around heroes and codes.
- Clash of Clans: evergreen search and calculators, but mature competitors already own many core keywords.
- Mobile Legends: Bang Bang: huge community, but a durable content product needs frequent editorial/tier-list labor.

The first traffic wedge is `gift codes + Frostfire Mine timer + Fire Crystal planner + resource data lab`, because these are high-frequency needs that can generate search visits and repeat visits without requiring daily hand-written articles. The resource lab now covers Furnace 30 to FC10 route totals, prerequisite FC/RFC tax, refined-crystal pacing, Chief Gear material gaps, Chief Charm material gaps, and War Academy shard pacing.

## Deploy

Upload this folder to any static host, or deploy it with Cloudflare Pages, Netlify, Vercel, or an object-storage static site.

After choosing a domain, replace `https://example.com` in:

- `index.html`
- `privacy.html`
- `contact.html`
- `disclaimer.html`
- `robots.txt`
- `sitemap.xml`

Replace the placeholder publisher id in `ads.txt` after AdSense approval. The homepage already has three non-blocking responsive ad slots reserved after the hero/status area, after the resource lab, and before the bottom utility sections.

## Local preview

```bash
python3 -m http.server 4173
```

Open `http://localhost:4173/whiteout-survival-tools/` if running from the workspace root, or `http://localhost:4173/` if running inside this folder.

If port 4173 is busy, use another port:

```bash
python3 -m http.server 4174
```

## Maintenance

- Update `data/content.json` for codes, event notes, planning estimates, source links, and `resourceDataLab` rows. Keep source-backed rows separate from modelled planning advice.
- Keep code status synchronized with `data/content.json` using explicit `active`, `expired`, or `official` labels and update the embedded JSON in `index.html` after data changes.
- Run `node launch-check.mjs` before deployment.
- When a real domain is ready, run `node set-domain.mjs https://your-domain.com`, then rerun `node launch-check.mjs`.

## Ads

AdSense is dormant until real approval/config is available. After approval:

```bash
node set-adsense.mjs ca-pub-1234567890123456 TOP_SLOT_ID TOOLS_SLOT_ID GUIDES_SLOT_ID
```

This updates `app.js`, `index.html`, and `ads.txt`. If slot ids are left blank, the layout stays reserved but live Google units will not render.

Ezoic should only be enabled after you have the real site id, verification meta value, and placement ids from the Ezoic dashboard:

```bash
node set-ezoic.mjs YOUR_SITE_ID YOUR_VERIFICATION_META TOP_PLACEMENT TOOLS_PLACEMENT GUIDES_PLACEMENT
```

Until those values are present, the site now falls back to AdSense instead of letting empty Ezoic placeholders take over the ad stack.

## Update pipeline

Use the local update scripts before deployment or on a recurring schedule:

```bash
node scripts/update-content.mjs
node scripts/sync-embedded-content.mjs
node launch-check.mjs
node scripts/audit-site.mjs
```

Recommended cadence: every 8 hours, which is roughly 3 refreshes per day.

The update script is intentionally conservative: it keeps only source-backed codes from reliable public references and automatically marks codes expired when their known expiry date has passed or the trusted reference no longer treats them as active. It also writes `refreshMeta`, which separates the data version from the latest source check. If public sources are temporarily unreachable, the site says it is using conservative fallback data instead of pretending fresh codes were found.

On GitHub Pages this is automated by `.github/workflows/update-content.yml`. The workflow runs at 00:07, 08:07, and 16:07 UTC, refreshes `data/content.json`, syncs the embedded homepage JSON, runs launch/audit checks, and commits only when the content files changed. You can also run it manually from the GitHub Actions tab with `workflow_dispatch`.
