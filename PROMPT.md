# PROMPT.md — Claude Code Prompts

> Prompts to paste into Claude Code to continue development. The original build prompts are gone; the site now follows the care-package redesign (v2).

---

## Continuation Prompt (every session)

```
Continue building Agooh & Ruks.

1. Read CLAUDE.md for the current state and the rules (branch, what never gets committed, the motion ceiling, DRAFT markers).
2. If redesign/NOTES.md exists, read it next: it holds the working notes, the owner's decisions and the list of drafts waiting for Ruks.
3. Read TASKS.md for the next unchecked task in the current phase.
4. Do the task. Run the gate: npm run typecheck, npm run lint, npm run build, npm test, npm run tells, node scripts/check-contrast.mjs, and npm run e2e against a running dev server when the admin or the data layer changed.
5. Update CLAUDE.md, TASKS.md and (if it exists) redesign/NOTES.md.
6. Commit on the current branch with a clear message. Never push to or merge into main; the owner merges the pull request.
```

---

## Key design rules (short form)

- One palette, two modes (Daylight / After hours), the device decides. No palette picker.
- Lora for display, Inter for text, Kalam for her handwriting (`.note`).
- Blush is the signature, cheek is for anything you can press, gold is jewellery (two per screen, shapes only), clay is for hairlines, sage is for outdoor content.
- Sentence case. No eyebrows, uppercase labels, italic accent words, middle dots, arrows or keyboard hints (`npm run tells` checks).
- Motion ceiling: the squish on save, one page fade, state changes under 220ms. Nothing on scroll.
- Every line in Ruks's voice is `// DRAFT: needs Ruks` until she approves it. Nothing invented in her name. Halal-conscious defaults. No AI images.
- TypeScript strict, Server Components by default, Firestore through the Admin SDK only, every new field optional with a read-time default.

---

## Description for Claude Project

```
Agooh & Ruks: my wife Ruks's recipe site (bakes first, some cooking, the odd story), designed as a care package from her. Next.js 16 + TypeScript + Tailwind v4, Firebase (Firestore + Auth), photos committed to the GitHub repo, Vercel hosting. Features: the Offering home page with her handwritten line and a Currently card, recipes with a scaler, oven conversions, cook mode and a print card, collections driven by charms, stories, newsletter, comments with moderation, an admin she can use from her phone.
```
