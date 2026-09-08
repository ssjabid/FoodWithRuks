// Checks WCAG contrast for every palette x mode defined in src/styles/globals.css.
// Usage: node scripts/check-contrast.mjs   (exit 1 if any pair is below its threshold)
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../src/styles/globals.css", import.meta.url), "utf8");

// Collect blocks: selector -> { token: hex }
const blocks = [];
const re = /((?:[^{}]|\n)*?)\{([^{}]*)\}/g;
let m;
while ((m = re.exec(css))) {
  const selector = m[1].trim().split("\n").pop().trim();
  if (!/data-palette|^:root|^\.dark/.test(selector)) continue;
  const vars = {};
  for (const line of m[2].split(";")) {
    const kv = line.match(/--color-([a-z-]+):\s*(#[0-9A-Fa-f]{6})/);
    if (kv) vars[kv[1]] = kv[2];
  }
  if (Object.keys(vars).length > 5) blocks.push({ selector, vars });
}

function lum(hex) {
  const c = [0, 2, 4].map((i) => parseInt(hex.slice(1 + i, 3 + i), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
const ratio = (a, b) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

// [foreground, background, minimum]
const PAIRS = [
  ["text-primary", "background", 7],
  ["text-primary", "surface", 4.5],
  ["text-primary", "elevated", 4.5],
  ["text-secondary", "background", 4.5],
  ["text-secondary", "surface", 4.5],
  ["text-tertiary", "background", 4.5],
  ["text-tertiary", "surface", 4.5],
  ["on-primary", "primary", 4.5],
  ["primary", "background", 4.5],
  ["accent-text", "background", 4.5],
  ["accent-text", "surface", 4.5],
  ["accent-text", "accent-soft", 4.5],
  ["on-band", "band", 4.5],
  ["error", "background", 4.5],
];

let failures = 0;
for (const { selector, vars } of blocks) {
  const rows = [];
  for (const [fg, bg, min] of PAIRS) {
    if (!vars[fg] || !vars[bg]) continue;
    const r = ratio(vars[fg], vars[bg]);
    const ok = r >= min;
    if (!ok) failures++;
    rows.push(`${ok ? "  ok " : "FAIL "} ${fg.padEnd(14)} on ${bg.padEnd(12)} ${r.toFixed(2)} (min ${min})`);
  }
  console.log(`\n${selector}`);
  console.log(rows.join("\n"));
}
console.log(failures ? `\n${failures} pair(s) below threshold` : "\nAll contrast pairs pass");
process.exit(failures ? 1 : 0);
