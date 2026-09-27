// Gate screenshots + axe for every stop of the redesign.
//
//   node scripts/snap.mjs <label> [baseUrl]      (default http://localhost:3000, dev server must be running)
//
// Writes .snapshots/<label>/<route>-<width>-<theme>.png (full page) at 390, 768 and 1440 in light and dark,
// one extra 390 light pass with reduced motion, an axe run per route at 1440 light (axe.json + a one-line
// summary; violations are reported, never fatal), the most [data-gold] elements visible in any one viewport,
// and an index.html contact sheet (phone first, light and dark side by side, axe summary on top).
// First time: npx playwright install chromium

import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { budgets } from "./design.config.mjs";

const label = process.argv[2];
if (!label) {
  console.error("Usage: node scripts/snap.mjs <label> [baseUrl]");
  process.exit(1);
}
const base = (process.argv[3] || process.env.SNAP_BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const outDir = path.join(".snapshots", label);
await fs.mkdir(outDir, { recursive: true });

const WIDTHS = [390, 768, 1440];
const THEMES = ["light", "dark"];
const NAV_TIMEOUT = 90_000; // dev server compiles routes on first hit

const browser = await chromium.launch();

async function newPage({ width, theme, reduced = false }) {
  const context = await browser.newContext({
    viewport: { width, height: width < 768 ? 844 : width < 1440 ? 1024 : 900 },
    colorScheme: theme,
    reducedMotion: reduced ? "reduce" : "no-preference",
    deviceScaleFactor: 1,
    locale: "en-GB",
    timezoneId: "Europe/London",
  });
  await context.addInitScript((mode) => {
    try {
      localStorage.setItem("ar_mode", mode);
    } catch {}
  }, theme);
  const page = await context.newPage();
  page.setDefaultNavigationTimeout(NAV_TIMEOUT);
  return { context, page };
}

async function firstLink(pathname, prefix) {
  const { context, page } = await newPage({ width: 1440, theme: "light" });
  try {
    await page.goto(base + pathname, { waitUntil: "networkidle" });
    const href = await page
      .locator(`main a[href^="${prefix}"]`)
      .first()
      .getAttribute("href", { timeout: 5_000 })
      .catch(() => null);
    return href;
  } finally {
    await context.close();
  }
}

console.log(`Snapshots for "${label}" from ${base}`);
const recipe = await firstLink("/recipes", "/recipes/");
const story = await firstLink("/lifestyle", "/lifestyle/");
const routes = [
  { name: "home", path: "/" },
  { name: "recipes", path: "/recipes" },
  recipe && { name: "recipe", path: recipe },
  { name: "stories", path: "/lifestyle" },
  story && { name: "story", path: story },
  { name: "about", path: "/about" },
  { name: "contact", path: "/contact" },
  { name: "newsletter", path: "/newsletter" },
  { name: "admin-login", path: "/admin/login" },
  { name: "missing", path: "/this-page-has-been-eaten" },
].filter(Boolean);

const results = []; // { route, width, theme, reduced, file, gold, error }
const axeResults = {};

async function settle(page) {
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.evaluate(() => document.fonts?.ready).catch(() => {});
  await page.waitForTimeout(400);
}

// Walks the page one viewport at a time: the most gold shapes and ornaments seen at once, and how many
// animations are still running after the walk (budgets in design.config.mjs).
async function auditViewport(page) {
  return page.evaluate(async () => {
    const vh = window.innerHeight;
    const total = document.documentElement.scrollHeight;
    const visible = (sel) =>
      [...document.querySelectorAll(sel)].filter((el) => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < vh;
      }).length;
    let gold = 0;
    let ornament = 0;
    for (let y = 0; y <= total; y += vh) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 40));
      gold = Math.max(gold, visible("[data-gold]"));
      ornament = Math.max(ornament, visible("[data-ornament]"));
    }
    await new Promise((r) => setTimeout(r, 400));
    const anim = typeof document.getAnimations === "function" ? document.getAnimations().filter((a) => a.playState === "running").length : 0;
    window.scrollTo({ top: 0, behavior: "instant" });
    return { gold, ornament, anim };
  });
}

for (const route of routes) {
  for (const width of WIDTHS) {
    for (const theme of THEMES) {
      const file = `${route.name}-${width}-${theme}.png`;
      const { context, page } = await newPage({ width, theme });
      try {
        await page.goto(base + route.path, { waitUntil: "domcontentloaded" });
        await settle(page);
        const audit = await auditViewport(page);
        await page.screenshot({ path: path.join(outDir, file), fullPage: true, animations: "disabled" });
        results.push({ route: route.name, width, theme, reduced: false, file, ...audit });
        process.stdout.write(".");
      } catch (error) {
        results.push({ route: route.name, width, theme, reduced: false, file, error: String(error.message || error) });
        process.stdout.write("x");
      } finally {
        await context.close();
      }
    }
  }

  // reduced motion pass, 390 light
  {
    const file = `${route.name}-390-light-reduced.png`;
    const { context, page } = await newPage({ width: 390, theme: "light", reduced: true });
    try {
      await page.goto(base + route.path, { waitUntil: "domcontentloaded" });
      await settle(page);
      await page.screenshot({ path: path.join(outDir, file), fullPage: true });
      results.push({ route: route.name, width: 390, theme: "light", reduced: true, file });
      process.stdout.write(".");
    } catch (error) {
      results.push({ route: route.name, width: 390, theme: "light", reduced: true, file, error: String(error.message || error) });
      process.stdout.write("x");
    } finally {
      await context.close();
    }
  }

  // axe, 1440 light
  {
    const { context, page } = await newPage({ width: 1440, theme: "light" });
    try {
      await page.goto(base + route.path, { waitUntil: "domcontentloaded" });
      await settle(page);
      const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
      axeResults[route.name] = axe.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        help: v.help,
        nodes: v.nodes.length,
        targets: v.nodes.slice(0, 3).map((n) => n.target.join(" ")),
      }));
    } catch (error) {
      axeResults[route.name] = [{ id: "axe-error", impact: "n/a", help: String(error.message || error), nodes: 0, targets: [] }];
    } finally {
      await context.close();
    }
  }
  console.log(` ${route.name}`);
}

await browser.close();

await fs.writeFile(path.join(outDir, "axe.json"), JSON.stringify(axeResults, null, 2));
await fs.writeFile(path.join(outDir, "results.json"), JSON.stringify({ base, routes, results }, null, 2));

// Console summary
console.log("\naxe (1440 light):");
for (const r of routes) {
  const v = axeResults[r.name] || [];
  const serious = v.filter((x) => x.impact === "serious" || x.impact === "critical").length;
  console.log(`  ${r.name.padEnd(12)} ${v.length} issue(s)${serious ? `, ${serious} serious/critical` : ""}${v.length ? ": " + v.map((x) => x.id).join(", ") : ""}`);
}
const goldMax = {};
const ornMax = {};
const animMax = {};
for (const r of results) {
  if (r.reduced || r.gold === undefined) continue;
  goldMax[r.route] = Math.max(goldMax[r.route] || 0, r.gold);
  ornMax[r.route] = Math.max(ornMax[r.route] || 0, r.ornament || 0);
  animMax[r.route] = Math.max(animMax[r.route] || 0, r.anim || 0);
}
const fmt = (o) => Object.entries(o).map(([k, v]) => `${k}=${v}`).join("  ") || "none";
console.log("gold (max visible in one viewport, budget " + budgets.goldPerViewport + "):", fmt(goldMax));
console.log("ornament (max visible in one viewport, budget " + budgets.ornamentPerViewport + "):", fmt(ornMax));
console.log("animations running after the scroll pass (budget " + budgets.animationsAfterScroll + "):", fmt(animMax));
const over = [
  ...Object.entries(goldMax).filter(([, v]) => v > budgets.goldPerViewport).map(([k, v]) => `${k}: ${v} gold`),
  ...Object.entries(ornMax).filter(([, v]) => v > budgets.ornamentPerViewport).map(([k, v]) => `${k}: ${v} ornaments`),
  ...Object.entries(animMax).filter(([, v]) => v > budgets.animationsAfterScroll).map(([k, v]) => `${k}: ${v} animations`),
];
if (over.length) {
  console.log("OVER BUDGET: " + over.join("; "));
  process.exitCode = 1;
}
const failed = results.filter((r) => r.error);
if (failed.length) console.log(`\n${failed.length} screenshot(s) failed:`, failed.map((f) => `${f.file}: ${f.error}`).join("\n  "));

// Contact sheet
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const html = `<!doctype html>
<html lang="en-GB"><head><meta charset="utf-8"><title>Snapshots: ${esc(label)}</title>
<style>
body{font:15px/1.5 system-ui,sans-serif;margin:24px;background:#f4f1ee;color:#222}
h1{font-size:22px;margin:0 0 4px}h2{font-size:18px;margin:32px 0 8px;border-bottom:1px solid #ccc;padding-bottom:4px}
.meta{color:#666;font-size:13px}
.axe{background:#fff;border:1px solid #ddd;padding:12px 16px;border-radius:6px;margin:12px 0 24px}
.axe li{margin:2px 0}.bad{color:#a33}.ok{color:#3a6}
.row{display:flex;gap:16px;align-items:flex-start;flex-wrap:wrap;margin:10px 0 18px}
figure{margin:0;background:#fff;border:1px solid #ddd;border-radius:6px;padding:8px}
figcaption{font-size:12px;color:#555;margin-bottom:6px}
img{display:block;max-height:900px;width:auto;max-width:100%;object-fit:contain;object-position:top}
.w390 img{width:300px}.w768 img{width:420px}.w1440 img{width:560px}
</style></head><body>
<h1>Snapshots: ${esc(label)}</h1>
<p class="meta">${esc(base)}, ${new Date().toLocaleString("en-GB")}. Phone first; light and dark side by side. Full-page images: scroll inside your browser to see the bottom.</p>
<div class="axe"><strong>axe (1440, light)</strong><ul>
${routes
  .map((r) => {
    const v = axeResults[r.name] || [];
    return `<li class="${v.length ? "bad" : "ok"}">${esc(r.name)}: ${v.length ? v.map((x) => `${esc(x.id)} (${esc(x.impact)}, ${x.nodes})`).join(", ") : "no issues"}</li>`;
  })
  .join("\n")}
</ul><strong>Gold visible at once (max per page)</strong>: ${esc(Object.entries(goldMax).map(([k, v]) => `${k} ${v}`).join(", ") || "none tagged yet")}</div>
${routes
  .map((r) => {
    const rows = WIDTHS.map((w) => {
      const pics = THEMES.map((t) => results.find((x) => x.route === r.name && x.width === w && x.theme === t && !x.reduced)).filter(Boolean);
      return `<div class="row w${w}">${pics
        .map((p) => (p.error ? `<figure><figcaption>${esc(p.file)}</figcaption><p class="bad">${esc(p.error)}</p></figure>` : `<figure><figcaption>${esc(p.file)}${p.gold ? ` (gold ${p.gold})` : ""}</figcaption><img loading="lazy" src="${esc(p.file)}" alt="${esc(p.file)}"></figure>`))
        .join("")}</div>`;
    }).join("\n");
    const reduced = results.find((x) => x.route === r.name && x.reduced);
    return `<h2>${esc(r.name)} <span class="meta">${esc(r.path)}</span></h2>${rows}${reduced && !reduced.error ? `<div class="row w390"><figure><figcaption>${esc(reduced.file)} (reduced motion)</figcaption><img loading="lazy" src="${esc(reduced.file)}" alt="${esc(reduced.file)}"></figure></div>` : ""}`;
  })
  .join("\n")}
</body></html>`;
await fs.writeFile(path.join(outDir, "index.html"), html);
console.log(`\nWrote ${results.length} screenshots + axe.json + index.html to ${outDir}`);
