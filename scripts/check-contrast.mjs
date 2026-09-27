// Contrast gate for the one palette (Daylight = :root, After hours = .dark) in src/styles/globals.css.
// Usage: node scripts/check-contrast.mjs   (exit 1 if any pair is below its threshold)
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../src/styles/globals.css", import.meta.url), "utf8");

// Collect the token blocks: the first `:root {` that defines --color-ground, and `.dark {`
function block(selector) {
  const re = new RegExp(`(^|\\n)${selector.replace(".", "\\.")}\\s*\\{([^}]*)\\}`, "g");
  const vars = {};
  let m;
  while ((m = re.exec(css))) {
    for (const line of m[2].split(";")) {
      const kv = line.match(/--color-([a-z0-9-]+):\s*(#[0-9A-Fa-f]{6})/);
      if (kv) vars[kv[1]] = kv[2];
    }
  }
  return vars;
}

function lum(hex) {
  const c = [0, 2, 4]
    .map((i) => parseInt(hex.slice(1 + i, 3 + i), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
const ratio = (a, b) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

// [foreground, background, minimum]. Gold is non-text (3:1); everything else is text.
const PAIRS = [
  ["text", "ground", 7],
  ["text-2", "ground", 4.5],
  ["text-3", "ground", 4.5],
  ["text", "surface", 4.5],
  ["text-2", "surface", 4.5],
  ["text-3", "surface", 4.5],
  ["text", "elevated", 4.5],
  ["text-3", "elevated", 4.5],
  ["on-blush", "blush", 4.5],
  ["text-2", "blush", 4.5],
  ["cheek", "ground", 4.5],
  ["cheek", "surface", 4.5],
  ["cheek", "blush", 4.5],
  ["cheek-hover", "ground", 4.5],
  ["on-cheek", "cheek", 4.5],
  ["on-cheek", "cheek-hover", 4.5],
  ["gold", "ground", 3],
  ["sage-ink", "ground", 4.5],
  ["sage-ink", "sage-soft", 4.5],
  ["success", "ground", 4.5],
  ["error", "ground", 4.5],
  ["text", "warning-bg", 4.5],
  ["mark-ink", "mark-body", 3],
];

const light = block(":root");
const dark = block(".dark");
let failures = 0;
for (const [name, vars] of [
  ["Daylight (:root)", light],
  ["After hours (.dark)", dark],
]) {
  console.log(`\n${name}`);
  for (const [fg, bg, min] of PAIRS) {
    if (!vars[fg] || !vars[bg]) {
      console.log(`MISS ${fg} / ${bg} (token not found)`);
      failures++;
      continue;
    }
    const r = ratio(vars[fg], vars[bg]);
    const ok = r >= min;
    if (!ok) failures++;
    console.log(`${ok ? "  ok " : "FAIL "} ${fg.padEnd(12)} on ${bg.padEnd(12)} ${r.toFixed(2)} (min ${min})`);
  }
}
console.log(failures ? `\n${failures} pair(s) below threshold` : "\nAll contrast pairs pass");
process.exit(failures ? 1 : 0);
