// Contrast gate for the palette. Reads the token blocks (Daylight = :root, After hours = .dark, or a
// prefers-color-scheme: dark media block) and checks the pairs generated from scripts/design.config.mjs.
//   node scripts/check-contrast.mjs                 -> src/styles/globals.css
//   node scripts/check-contrast.mjs path/to.css     -> any stylesheet that defines --color-* tokens
// Exit 1 if any pair is below its threshold or a required token is missing.
import { readFileSync } from "node:fs";
import { contrast } from "./design.config.mjs";

const file = process.argv[2] || new URL("../src/styles/globals.css", import.meta.url);
const css = readFileSync(file, "utf8");

/** Returns the text between the braces that open at `open` (index of "{"). */
function braced(text, open) {
  let depth = 0;
  for (let i = open; i < text.length; i++) {
    if (text[i] === "{") depth++;
    else if (text[i] === "}" && --depth === 0) return { body: text.slice(open + 1, i), end: i + 1 };
  }
  return { body: text.slice(open + 1), end: text.length };
}

function tokensIn(body) {
  const vars = {};
  for (const line of body.split(";")) {
    const kv = line.match(/--color-([a-z0-9-]+):\s*(#[0-9A-Fa-f]{6})\b/);
    if (kv) vars[kv[1]] = kv[2].toUpperCase();
  }
  return vars;
}

/** All `selector {` blocks at the top level of `text` (nested ones are skipped). */
function blocks(text, selector) {
  const out = [];
  const re = new RegExp(`(^|[\\n}])\\s*${selector.replace(/[.:]/g, "\\$&")}\\s*\\{`, "g");
  let m;
  while ((m = re.exec(text))) {
    const open = text.indexOf("{", m.index + m[0].length - 1);
    const { body, end } = braced(text, open);
    out.push(body);
    re.lastIndex = end;
  }
  return out;
}

// split out the dark media block(s) so their :root does not pollute the light set
let lightText = "";
let darkText = "";
const mediaRe = /@media[^{]*prefers-color-scheme\s*:\s*dark[^{]*\{/g;
let cursor = 0;
let mm;
while ((mm = mediaRe.exec(css))) {
  const open = mm.index + mm[0].length - 1;
  const { body, end } = braced(css, open);
  darkText += body + "\n";
  lightText += css.slice(cursor, mm.index);
  cursor = end;
  mediaRe.lastIndex = end;
}
lightText += css.slice(cursor);
const light = Object.assign({}, ...blocks(lightText, ":root").map(tokensIn));
const dark = Object.assign({}, ...blocks(lightText, ".dark").map(tokensIn), ...blocks(darkText, ":root").map(tokensIn), ...blocks(darkText, ".dark").map(tokensIn));

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

const pairs = [];
for (const fg of contrast.textRoles) for (const bg of contrast.surfaceRoles) pairs.push([fg, bg, fg === "text" && bg === "ground" ? contrast.textOnGround : contrast.text]);
pairs.push(...contrast.pairs);

let failures = 0;
for (const [name, vars] of [
  ["Daylight (:root)", light],
  ["After hours (.dark)", dark],
]) {
  console.log(`\n${name}`);
  if (Object.keys(vars).length === 0) {
    console.log("MISS no --color-* tokens found");
    failures++;
    continue;
  }
  const check = ([fg, bg, min], optional) => {
    if (!vars[fg] || !vars[bg]) {
      if (optional) return;
      console.log(`MISS ${fg} / ${bg} (token not found)`);
      failures++;
      return;
    }
    const r = ratio(vars[fg], vars[bg]);
    const ok = r >= min;
    if (!ok) failures++;
    console.log(`${ok ? "  ok " : "FAIL "} ${fg.padEnd(16)} on ${bg.padEnd(16)} ${r.toFixed(2)} (min ${min})`);
  };
  for (const p of pairs) check(p, false);
  for (const p of contrast.optionalPairs) check(p, true);
}
console.log(failures ? `\n${failures} pair(s) below threshold` : "\nAll contrast pairs pass");
process.exit(failures ? 1 : 0);
