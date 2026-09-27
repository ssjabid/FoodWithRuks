// Regenerates the static mark files from src/lib/mark.ts, coloured from src/lib/tokens.ts:
//   src/app/icon.svg          (favicon, resting face)
//   public/icon-asleep.svg    (the favicon nods off when the tab is hidden)
// Usage: npm run gen:mark   (runs gen-tokens first, then node --experimental-transform-types scripts/gen-mark.mjs)
import { writeFileSync } from "node:fs";
import { markSvg } from "../src/lib/mark.ts";
import { TOKENS } from "../src/lib/tokens.ts";

const L = TOKENS.light;
const colours = { body: L["mark-body"], ink: L["mark-ink"], cheek: L["mark-cheek"] };
writeFileSync("src/app/icon.svg", markSvg("squished", colours) + "\n");
writeFileSync("public/icon-asleep.svg", markSvg("asleep", colours) + "\n");
console.log("wrote src/app/icon.svg and public/icon-asleep.svg");
