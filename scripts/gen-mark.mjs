// Regenerates the static mark files from src/lib/mark.ts:
//   src/app/icon.svg          (favicon, resting face)
//   public/icon-asleep.svg    (the favicon nods off when the tab is hidden)
// Usage: node --experimental-transform-types scripts/gen-mark.mjs
import { writeFileSync } from "node:fs";
import { markSvg } from "../src/lib/mark.ts";

const light = { body: "#E3C4A6", ink: "#2B1E1B", cheek: "#EBB2B0" };
writeFileSync("src/app/icon.svg", markSvg("squished", light) + "\n");
writeFileSync("public/icon-asleep.svg", markSvg("asleep", light) + "\n");
console.log("wrote src/app/icon.svg and public/icon-asleep.svg");
