// Scans public code for template tells and banned words so they cannot creep back.
// Usage: node scripts/tells.mjs   (exit 1 on any hit). Allow a genuine exception with a `tells-ok` comment on the line.
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve("src");
const SKIP_DIRS = new Set(["admin"]); // /admin is redesigned in Phase 6; it may keep its own vocabulary
const EXT = new Set([".ts", ".tsx", ".css"]);

const TELLS = [
  { re: /\beyebrow\b/, why: "all-caps eyebrow label" },
  { re: /accent-italic/, why: "the italic accent word" },
  { re: /\buppercase\b/, why: "uppercase label (sentence case only)" },
  { re: /·/, why: "middle dot in copy (write a sentence, see src/lib/facts.ts)" },
  { re: /→|&rarr;/, why: "arrow appended to a link" },
  { re: /⌘|Ctrl\+K|Cmd\+K/, why: "keyboard-shortcut hint" },
  { re: /\bfont-mono\b/, why: "monospace label" },
];

const BANNED_WORDS = [
  "delish", "yummy", "nom", "foodie", "to die for", "mouth-watering", "mouthwatering", "decadent", "elevate", "indulge",
  "game-changer", "the best ever", "you won't believe", "welcome to my blog", "stay connected", "no spam, ever", "exotic",
  "guilt-free", "sinful", "cheat day", "naughty",
];
const BANNED = BANNED_WORDS.map((w) => ({ re: new RegExp(`\\b${w.replace(/[-\s]/g, "[-\\s]")}\\b`, "i"), why: `banned word "${w}"` }));

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
for (const file of walk(ROOT)) {
  const lines = readFileSync(file, "utf8").split(/\r?\n/);
  lines.forEach((line, i) => {
    if (line.includes("tells-ok")) return;
    for (const t of [...TELLS, ...BANNED]) {
      if (t.re.test(line)) {
        hits++;
        console.log(`${path.relative(process.cwd(), file)}:${i + 1}  ${t.why}\n    ${line.trim().slice(0, 120)}`);
      }
    }
  });
}
console.log(hits ? `\n${hits} tell(s) found` : "No template tells found");
process.exit(hits ? 1 : 0);
