// One place for the rules the design guards enforce. Read by scripts/tells.mjs, scripts/check-contrast.mjs
// and scripts/snap.mjs. Change a rule here, not in three scripts.

/** Template tells that must not appear in public code (src/, outside /admin). `allowIn` lists class or selector
 *  words that make a hit acceptable on that line (a stamp may be uppercase; nothing else may). */
export const tells = [
  { re: /\beyebrow\b/, why: "all-caps eyebrow label" },
  { re: /accent-italic/, why: "the italic accent word" },
  { re: /\buppercase\b/, why: "uppercase label (sentence case only)", allowIn: ["stamp", "sticker"] },
  { re: /·/, why: "middle dot in copy (write a sentence, see src/lib/facts.ts)" },
  { re: /→|&rarr;/, why: "arrow appended to a link" },
  { re: /⌘|Ctrl\+K|Cmd\+K/, why: "keyboard-shortcut hint" },
  { re: /\bfont-mono\b/, why: "monospace label" },
];

/** Words that never appear in visitor-facing copy. Whole-word, case-insensitive, hyphen and space interchangeable. */
export const bannedWords = [
  "delish", "yummy", "nom", "foodie", "to die for", "mouth-watering", "mouthwatering", "decadent", "elevate", "indulge",
  "game-changer", "the best ever", "you won't believe", "welcome to my blog", "stay connected", "no spam, ever", "exotic",
  "guilt-free", "sinful", "cheat day", "naughty",
];

/** Colour aliases kept for the admin only. Public code uses the semantic tokens. */
export const legacyAliases = [
  "primary", "primary-hover", "on-primary", "secondary", "accent", "accent-soft", "accent-text", "background",
  "text-primary", "text-secondary", "text-tertiary", "border", "placeholder-icon", "band", "on-band",
];

/** Contrast: pairs are generated from the roles, then the explicit list is added. Optional pairs are checked
 *  only when both tokens exist (so a direction may add --color-paper without every palette needing it). */
export const contrast = {
  textOnGround: 7,
  text: 4.5,
  nonText: 3,
  textRoles: ["text", "text-2", "text-3"],
  surfaceRoles: ["ground", "surface", "elevated"],
  pairs: [
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
  ],
  // Text on the tinted blocks a direction may add. Tinted panels themselves need no ratio against the page.
  optionalPairs: [
    ["text", "paper", 4.5],
    ["text", "sage-soft", 4.5],
    ["text", "mustard-soft", 4.5],
    ["text", "sky-soft", 4.5],
    ["text-2", "sky-soft", 4.5],
    ["text-2", "mustard-soft", 4.5],
    ["text-2", "sage-soft", 4.5],
  ],
};

/** Ornament budgets, checked by scripts/snap.mjs per viewport (the most seen at once on a page). */
export const budgets = {
  goldPerViewport: 2, // gold shapes: the pendant, a selected charm's ring
  ornamentPerViewport: 6, // anything tagged data-ornament (doodles, stamps, frames, tags)
  animationsAfterScroll: 6, // document.getAnimations() still running after a scroll pass
};
