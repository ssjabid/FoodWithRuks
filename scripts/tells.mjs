// Scans public code for template tells, banned words and legacy colour aliases so they cannot creep back.
// Rules live in scripts/design.config.mjs. Usage: node scripts/tells.mjs   (exit 1 on any hit)
// Allow a genuine exception with a `tells-ok` comment on the line.
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { tells, bannedWords, legacyAliases } from "./design.config.mjs";

const ROOT = path.resolve("src");
const SKIP_DIRS = new Set(["admin", "__tests__"]); // /admin keeps its own vocabulary until Phase D
const EXT = new Set([".ts", ".tsx", ".css"]);

const banned = bannedWords.map((w) => ({ re: new RegExp(`\\b${w.replace(/[-\s]/g, "[-\\s]")}\\b`, "i"), why: `banned word "${w}"` }));
const aliasRe = new RegExp(`--color-(${legacyAliases.join("|")})\\b`);

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) {
      if (SKIP_DIRS.has(name)) continue;
      walk(p, out);
    } else if (EXT.has(path.extname(name))) out.push(p);
  }
  return out;
}

let hits = 0;
const report = (file, i, why, line) => {
  hits++;
  console.log(`${path.relative(process.cwd(), file)}:${i + 1}  ${why}\n    ${line.trim().slice(0, 120)}`);
};

for (const file of walk(ROOT)) {
  const isGlobals = file.endsWith(path.join("styles", "globals.css"));
  const lines = readFileSync(file, "utf8").split(/\r?\n/);
  lines.forEach((line, i) => {
    if (line.includes("tells-ok")) return;
    for (const t of tells) {
      if (!t.re.test(line)) continue;
      if (t.allowIn && t.allowIn.some((token) => line.includes(token))) continue;
      report(file, i, t.why, line);
    }
    for (const b of banned) if (b.re.test(line)) report(file, i, b.why, line);
    // the alias definitions themselves live in globals.css (admin only); uses elsewhere are the tell
    if (!isGlobals && aliasRe.test(line)) report(file, i, `legacy colour alias in public code (${line.match(aliasRe)[0]}); use a semantic token`, line);
  });
}
console.log(hits ? `\n${hits} tell(s) found` : "No template tells found");
process.exit(hits ? 1 : 0);
