# CLAUDE.md — Agooh & Ruks Project State

> This file is the single source of truth for Claude Code. Read before every task. Update after every completed task. Design decisions follow the redesign brief (private, git-ignored `redesign/`); this file wins on how the code works.

## Project

**Agooh & Ruks** (formerly FoodWithRuks) is Ruks's recipe site: bakes first, some cooking, and the odd story. Byline "Pass the Butter, Ruks". The design idea is **a care package from Ruks**: the home page hands you a bake, the recipe is the note inside, every tool looks after the reader. Principles: "Here, I made you something"; crisp outside, soft inside; one or two rings on (gold rationed); alive, not animated; real over generic. Halal-conscious defaults everywhere. No AI images. Nothing invented in her voice: every line written for her is marked `// DRAFT: needs Ruks` and listed in `redesign/NOTES.md` until she approves it.

## Current State

**Phase**: Redesign, branch `redesign/care-package`. Phases 0 to 4 built and gated (commit 09a786a: typecheck, lint, build, unit tests 16/16, tells, contrast, e2e 27/27, 70 screenshots with 0 axe issues, production console clean). Waiting for the owner's review. Next: Phase 5 (signature moments), Phase 6 (admin at 390px + HOW-TO-POST.md), Phase 7 (QA, PR the owner merges).
**Last Updated**: 2026-09-27
**Last Task Completed**: Phases 2 to 4 of the care-package redesign in one sweep: one palette with semantic tokens (Daylight / After hours, device-following), Lora + Inter + Kalam, the squish mark and brand parts, Bakes / Cooking / Stories / About navigation with a top menu sheet, the Offering home page (kitchen-time line, Currently card, New out of the oven, collections, stories, email line), the recipe page (facts line, scaler, oven line, tappable method, cook mode, print card, verdicts, keeps, click-to-load Instagram, comments with a 3-rating floor), recipes index with group tabs / category chips / charm filters, `/bakes`, `/cooking`, `/collections/[slug]`, `/privacy`, `/bakery` (hidden), new 404, About with the pair mark, admin recipe form with the new fields and "The personal bits", settings (front-page bake, her line, lead collection, bakery switch), pages (Currently + photo alt), dashboard Currently card, new icons and OG cards, fixtures policy (dev: six example bakes; production: one labelled example), e2e extended. Previously (all live on `main`): production audit, rich-text editor + editable pages, photo uploads to the GitHub repo, Clay palette lock, page transitions.

## Redesign in progress (2026-09-26 onwards)

Built on `redesign/care-package`, phase by phase, with the owner reviewing at every stop. Working notes and the private brief live in the git-ignored `redesign/` folder (read `redesign/NOTES.md` first; nothing from that folder, the pack zips or `START-HERE_redesign.md` is ever committed or quoted). Gate screenshots go in the git-ignored `.snapshots/<label>/` (`npm run snap <label>`; `npx playwright install chromium` once; Playwright browsers may live in `PLAYWRIGHT_BROWSERS_PATH`). **Claude never pushes to or merges into `main`**; the owner merges the pull request at the end. Push the branch only when asked. Session start: `git fetch origin` and `git merge origin/main` (admin photo uploads commit to `main`).

## Live deployment (important)

- **Production**: https://foodwithruks.vercel.app, Vercel Git integration, **every push to `main` deploys to production**.
- Work on a branch; Vercel builds a preview per branch (URL on the commit's deployment status in GitHub; previews are behind Vercel login, so the account owner opens them). Merge to `main` only after the preview is verified.
- `foodwithruks.com` is NOT registered. `SITE_URL` (src/lib/site.ts) resolves `NEXT_PUBLIC_SITE_URL` → Vercel production URL → `https://foodwithruks.vercel.app`.
- Firestore rules + composite indexes are deployed (2026-09-07). Firestore is empty (0 recipes, 0 posts as of 2026-09-20). With an empty database production shows the honest empty state plus **one** example bake labelled "Example: not one of Ruks's yet" (excluded from sitemap, feed, JSON-LD and indexing); development and preview deployments show six example bakes and two placeholder stories (`src/lib/content.ts`). Fixtures disappear as soon as one real recipe is published.
- Local dev: `.env.local` has the service-account key pasted with a mix of escaped and real newlines; `admin.ts` normalises it. Scratch scripts that use the Admin SDK must do the same (`@next/env` default import + collapse newlines).

## Tech Stack

- Next.js 16 (App Router) + React 19 + TypeScript strict
- Tailwind CSS v4 (CSS-first `@theme` / `@utility` in `src/styles/globals.css`, no tailwind.config)
- Fonts via next/font: **Lora** (display and headings), **Inter** (text), **Kalam** (her handwriting layer, `.note`). Variables on `<html>`, `lang="en-GB"`.
- Firebase: Firestore via Admin SDK (server only), Auth (Google sign-in, client SDK auth only)
- **No animation library anywhere.** `framer-motion` was removed on 2026-09-27; the admin uses the same CSS transitions as the public site.
- Vercel hosting; react-social-media-embed (Instagram, click-to-load on recipe pages); Playwright + axe for gate screenshots; node:test for the small libraries.
- **Design guards read one config**, `scripts/design.config.mjs` (tells, banned words, legacy aliases, contrast roles and pairs, ornament budgets). `scripts/gen-tokens.mjs` writes `src/lib/tokens.ts` from `globals.css` so OG images and icons never carry their own hex (`npm run gen:tokens`, run automatically by `npm run gen:mark`).

## Design system (v2, the care package)

- **One palette, two modes.** Tokens live on `:root` (Daylight) and `.dark` (After hours) in `globals.css`; the visitor's device decides (`DEFAULT_MODE = "system"`), the header toggle overrides per visitor (`localStorage` `ar_mode`). There is **no palette picker** any more; `ar_palette` and `ar_picker_seen` are removed on first load.
- **Semantic tokens**: `--color-ground` (page), `surface`, `elevated`, `text`, `text-2`, `text-3`, `blush` + `on-blush` (the signature: Currently card, charms, cheeks; never text), `cheek` + `cheek-hover` + `on-cheek` (links, buttons, focus, selected), `gold` (shapes only, at most two per screen, each tagged `data-gold`), `clay` (hairlines, strokes, the parcel tag; never text), `line` + `line-strong`, `sage` + `sage-ink` + `sage-soft` (outdoor content only: Trail-tested), `success`, `error`, `warning-bg`, `placeholder-bg/ink`, `mark-body/ink/cheek`. Light values: ground #FFFAF8, surface #F8EFEC, text #2B1E1B / #5E4843 / #7A625C, blush #EECFCA, cheek #9E3A53, gold #B08A3C, clay #C7A491, sage #919682. Dark: ground #1E1614, surface #2A201D, text #FBEFEB / #D9C3BD / #B39B94, blush #4A2F30, cheek #F2A5B6 (on-cheek cocoa), gold #D9B56A. Legacy aliases (`--color-primary`, `--color-text-primary`, `--color-border`, …) remain defined **for the admin only**. `node scripts/check-contrast.mjs` checks every pair in both modes.
- **Type**: `h-display` (40–64px, the bake's name), `h-page` (32–44), `h-section` (24–30), `h-card` (20), `text-body` (17px/1.65), `.note` (Kalam, 22px). Sentence case everywhere. **No** eyebrows, uppercase labels, italic accent word, middle-dot metas, arrows on links, keyboard-shortcut hints or bracket counts; `npm run tells` fails the build on them and on the banned words (allow a genuine exception with a `tells-ok` comment).
- **Brand parts** (`src/components/brand/`): `Mark` (the squish: a round bake with closed smiling eyes, rosy cheeks and a bite out of the top right; states `squished` / `open` / `asleep`; variants `single` / `pair`; `crumbs` for the 404; geometry in `src/lib/mark.ts`, static files via `npm run gen:mark`), `Wordmark` (cheek ampersand), `Necklace` (hairline with a gold pendant, one or two per page), `Note` (her handwriting, real text, never for essential information), `Charm` (badge chips with tiny line icons; Trail-tested in sage; `as="link" | "chip" | "button"`), `Placeholder` (honest "photo coming" frame, used by `Photo` when `src` is empty).
- **Flat**: no shadows, hairline borders, radii 6/8/12px, round buttons and fields (48px tall on mobile, 44px minimum targets). Focus: 2px cheek outline. Fields `.field` / `.field-bare`, links `.link` / `.link-cheek`.
- **Motion ceiling**: the Squish on save (`.squish-btn[data-squish]`, 360ms), page fade 280ms (`PageEnter`, never on first load, never under `/admin`), drawer/sheet 220ms, state changes 120–200ms, hover = colour only, cards = title underline + image opacity 0.9. Nothing on scroll, no entrances, no lifts. `prefers-reduced-motion` zeroes everything.
- **Copy**: every line in Ruks's voice is in `src/lib/copy.ts` (`COPY`) or marked `// DRAFT: needs Ruks` where it lives (collections intros, kitchen-time lines, About default). British spelling, dates "26 September 2026".

## Navigation and chrome

- Header (56px, sticky, hairline): `Wordmark` left, visible nav **Bakes · Cooking · Stories · About** from 768px (Cooking hidden while nothing is published in the cooking group; the root layout computes `showCooking`), search button, light/dark `ThemeToggle`, menu button below 768px. The menu is a top sheet (`MenuSheet` in `NavDrawer.tsx`: nav items + Say hello + New bakes by email). `SearchOverlay` searches recipes and links to Bakes / Cooking / Stories. Skip link to `#main`. `FaviconNod` swaps the favicon to the asleep mark when the tab is hidden (`EASTER_EGGS.faviconNodsOff`).
- Footer: `Necklace`, "Baked by Ruks. Tested by Agooh." (DRAFT), the footer line from `/admin/pages`, `FOOTER_LINKS` (nav + Say hello, New bakes by email, Privacy), Instagram, RSS.

## Taxonomy (src/lib/constants.ts)

- `CATEGORY_GROUPS`: bakes (`/bakes`), cooking (`/cooking`), little-ones (`/recipes?group=little-ones`). `RECIPE_CATEGORIES` carry a `group`: cookies-biscuits, brownies-traybakes, cakes, cheesecakes, pastries-tarts, pancakes-breakfast, bread, desserts ("Puddings") in bakes; starters, mains, sides, snacks, drinks in cooking; baby-weaning ("Little ones"). Every old value is kept.
- `MEAL_TYPES`, `DIETARY_TAGS` (no Halal tag: halal is the baseline), `SPECIAL_OCCASIONS` (eid, ramadan, christmas, date-night, quick-weeknight), `DIFFICULTY_OPTIONS`, `UNIT_OPTIONS`, `YIELD_KINDS` (serves | makes), `SORT_OPTIONS` (newest | quickest = prep + cook).
- `BADGES` (charms): first-try, travels-well, little-helpers, trail-tested, make-ahead, taste-testers-pick; each drives a collection (`src/lib/collections.ts`: care-packages with "How to pack a tin" tips, first-tries, trail-tested (sage), little-helpers, make-ahead, taste-testers-picks, plus the seasonal ramadan and eid by occasion). Collections are filters over the cached published list; empty ones are never linked and 404 in production.
- `LIFESTYLE_CATEGORIES` (Stories): days-out, eating-out, travel, parenting, craft-hobbies. `NAV_ITEMS`, `FOOTER_LINKS`.

## Pages

| Route | Notes |
|---|---|
| `/` | `KitchenTime` line (client, Europe/London slots; asleep mark late at night) · honest `EmptyKitchen` in production while nothing is published · the **Offering** (pinned or newest bake: photo, name as `h1`, her line in Kalam from `siteSettings.heroNote` or the recipe's `ruksNote`, the facts line, optional intro from `/admin/pages`, "Get the recipe") · **New out of the oven** (newest large + two small) beside the blush **Currently** card (hidden when all four rows are empty) · collections row (non-empty only, the admin's lead collection first) · "The ones people come back for" only with ≥12 real recipes and views · Stories teaser (3) · `EmailLine` (Instagram link + newsletter). `revalidate = 3600`. |
| `/recipes`, `/bakes`, `/cooking` | `RecipesClient`: group tabs (All / Bakes / Cooking / Little ones, empty groups hidden), category chips for the group, charm filters, Saved toggle, sort Newest / Quickest, search box. URL is the source of truth (`group`, `category`, `badge`, `sort`, `q`). First card large from four results. Empty search → "Nothing by that name yet. Ruks takes requests." with a button to `/contact?subject=Recipe request: …`. Fallback mirrors the header. |
| `/recipes/[slug]` | `RecipePageClient`: portrait photo, name, her note, charms, facts line, Jump to recipe + **Save** (the squish, `aria-pressed`, `ar_favorites`), short story (first paragraph + "Read the rest" past 150 words), ingredients with the **scaler** (serves: stepper; makes: ½× 1× 2× 3× with the batch line) and fraction glyphs, **oven line** (fan/conventional/°F/gas from `src/lib/oven.ts` + "Ovens vary. Yours knows best."), tappable numbered method + **Keep the screen on** (Wake Lock, feature-detected), keeps / tips / verdicts (The taste-tester, Agooh) / inspired by, click-to-load `InstagramCard`, print + share (Copy link, WhatsApp), comments (average shown only from 3 ratings), More like this (`moreLikeThis`: same badge or group). JSON-LD Recipe with `recipeYield`, ISO times incl. extra time, `aggregateRating` only with ≥3 real ratings; the example bake is `noindex` with a banner and no JSON-LD. Per-recipe OG image (`opengraph-image.tsx`: photo + name, mark fallback). |
| `/collections/[slug]` | Intro (DRAFT), tips block with the parcel tag (care packages), sage header (trail-tested), `RecipeGrid`. Static params for all collections. |
| `/lifestyle`, `/lifestyle/[slug]` | Stories: `StoryCard` (photo, category, title, date), chips only for categories with posts, `?category=`; post = category, title, date + read time, wide photo, `.prose`, share, More stories. |
| `/about` | Server page from `siteSettings/pages` (title, subtitle, HTML body, photo + alt; the pair mark on blush until her photo), sign-off "Ruks x" (DRAFT), All the bakes + Say hello + Instagram. |
| `/contact` | "Say hello." `ContactClient` reads `?subject=` (Suspense-wrapped). `/newsletter` "New bakes by email". `/privacy` plain-English page. `not-found` "Someone's eaten this page." with the crumbs pair. |
| `/bakery` | Hidden waitlist ("The someday bakery"): 404 + noindex unless `siteSettings.showBakery`; newsletter source `bakery`. |
| `/admin/*` | Dashboard (Currently card first, editable in place), recipes (form with yield kind/noun, oven, extra time, photo descriptions, collapsed "The personal bits": her note, charms, verdicts, inspired by, keeps), stories (cover alt), **pages** (Currently rows with a 30-day nudge, front-page line, footer line, About incl. photo alt), comments, messages, subscribers (CSV; source labels incl. Bakery waitlist), settings (front-page bake, her line, lead collection, Instagram handle, bakery switch). |
| Metadata routes | `icon.svg` + `public/icon-asleep.svg` (generated from the mark), `apple-icon.tsx` (mark on blush), `opengraph-image.tsx` (mark + wordmark + byline), `robots.ts` (disallows /admin, /api, /preview, /bakery), `sitemap.ts` (real content + non-empty collections; never fixtures), `feed.xml` (real content only). |

## Content model additions (all optional, defaults at read time, no migration)

- Recipe: `yieldKind` ("serves" | "makes"), `yieldNoun {one, other}`, `extraTime {minutes, label} | null` (chilling, proving…; counted in JSON-LD totalTime, shown as "plus overnight chilling"), `oven {tempC, fan} | null`, `ruksNote`, `badges[]`, `verdicts {tasteTester?, agooh?}`, `inspiredBy`, `keeps`, `heroImageAlt`, `instructions[].imageAlt`, `sample` (fixtures only, never settable).
- `SiteSettings {recipeOfTheWeekSlug, instagramHandle, heroNote, activeCollection, showBakery}` (old palette fields are ignored if present). `PageContent` + `aboutPhotoAlt` + `currently {baking, craving, lastWalk, latestParcel, updatedAt}`. `LifestylePost.coverImageAlt`. `SubscriberSource` + `"bakery"`.
- Libraries with `node:test` coverage (`npm test`): `facts.ts` (formatMinutes, formatExtraTime, yieldText, timeText, factsLine, jsonLdYield, totalMinutes, isoDuration, formatDateLong, formatMonth), `oven.ts` (UK table incl. 110/120°C, fan + 20 rule, snap ±5), `scale.ts` (fractions, rounding rules, BATCH_OPTIONS), `kitchenTime.ts` (Europe/London slots), `collections.ts`.
- Fixtures: `src/lib/sampleData.ts` (six example bakes + two placeholder stories, all `sample: true`, ratings 0, no photos) chosen by `src/lib/content.ts` (`recipesOrFixtures`, `postsOrFixtures`, `fixtureRecipeBySlug`, `IS_PRODUCTION`). `src/lib/recipePool.ts` is the shared cached read for index pages.

## Photo uploads (GitHub as the image store)

- Photos are committed into the repo at `public/images/uploads/<folder>/<yyyy>/<mm>/<slug>-<id>-w<width>.webp` (folders: recipes, lifestyle, steps, misc) and served as static files by the next production deploy. Until then the admin previews from `raw.githubusercontent.com` (`rawContentUrl()` in `site.ts`).
- Client: `src/lib/imageResize.ts` (EXIF-aware resize to 1600/800px WebP) and `src/components/admin/ImageUpload.tsx`. Server: `src/lib/github.ts` (`commitFiles()`), `src/app/api/admin/upload/route.ts` (admin token check, 503 when `GITHUB_UPLOAD_TOKEN` is missing). Env: `GITHUB_UPLOAD_TOKEN`, `GITHUB_REPO`, `GITHUB_BRANCH`.
- Public rendering: `src/components/shared/Photo.tsx` (plain `<img loading=lazy>`, srcset from the `-w1600/-w800` naming, `ratio` square/landscape/portrait/wide or `fit="natural"`, `priority`, `label` for the placeholder caption, falls back to `Placeholder`). Uploads move `main`; always merge `origin/main` before pushing.

## Editor + editable pages

- `src/components/admin/RichTextEditor.tsx`: Tiptap 3, admin only. Output is HTML rendered by `.prose`. Forms strip `rawContentUrl("public")` on save so stored HTML uses site paths.
- `src/lib/firebase/pageContent.ts`: `DEFAULT_PAGE_CONTENT` (minimal, true, DRAFT About body), `EMPTY_CURRENTLY`, `currentlyFrom`, `currentlyIsEmpty`, `getPageContentSafe()`. `GET/PUT /api/admin/pages` (per-field caps, `currently` via `normaliseCurrently`, revalidates layout).

## Content pipeline guarantees (audit 2026-09-20, extended 2026-09-27)

- **Validation at the API boundary** (`src/lib/validation.ts`): `normaliseRecipeInput` / `normalisePostInput` / `normaliseCurrently` return complete, safe payloads: unknown fields dropped, strings trimmed and capped (`LIMITS`: yieldNoun 24, ruksNote 120, verdict 140, inspiredBy 80, keeps 140, alt 160, extraTime label 24 / minutes ≤7200, oven 50–300°C, heroNote 80, currently 60), enums checked against `constants.ts`, slugs derived and unique (409), `rating` / `viewCount` / `sample` / timestamps never settable. `ValidationError` → 400 with a human message the forms show.
- **Comments + ratings**: `POST /api/comments` (honeypot, 5 per 10 min per IP, recipe must be published) → pending; approving in `/admin/comments` recomputes the recipe rating and revalidates. The public average only shows from 3 ratings.
- **Views**: `ViewPing` once per session (`POST /api/recipes/view`, 1 per IP per slug per hour); skipped on previews and the example bake. Feeds "The ones people come back for" (gated) and the admin.
- **Draft previews**: `/preview/{recipe|post}/{slug}/{token}` (HMAC token, `src/lib/previewToken.ts`), Preview buttons in the admin forms.
- **Revalidation**: `src/lib/revalidate.ts` (`revalidateRecipes` → /, /recipes, /bakes, /cooking, every collection, the recipe, sitemap, feed; `revalidatePosts`; `revalidateSiteCopy` → layout).
- **RSS** `/feed.xml`, robots, sitemap: real published content only.
- **End-to-end test** `npm run e2e` (`scripts/e2e-admin.mjs`) against a running server: auth, validation 400s incl. the new limits, create (new fields round-trip) / 409 / publish / delete, public page (facts line, oven line, note, charm, keeps), `/bakes` and the collection, home / sitemap / feed, view ping, comments (honeypot, 404, pending, approve → rating + render), stories, contact + newsletter → admin inboxes, front-page bake + her line + limits, home intro + Currently card + limits, bakery switch + robots, upload guard. Everything it creates is deleted and settings/pages restored in `finally`. Locally the test address must be in `.env.development.local` (`ADMIN_EMAIL=...,e2e-admin@agoohandruks.test`). Do not add it to the Vercel allow-list.

## Newsletter

- `POST /api/newsletter` → Firestore `subscribers` (doc id = normalised email; honeypot; sources home | footer | newsletter-page | bakery; always `{ok:true}` on success/duplicate). `NewsletterForm` variants inline (home), compact (footer), stacked (/newsletter, /bakery) with `buttonLabel`. Admin: `/admin/subscribers`, CSV export.

## Site settings

- Firestore `siteSettings/general` `{ recipeOfTheWeekSlug, instagramHandle, heroNote, activeCollection, showBakery, updatedAt }` (`src/lib/firebase/siteSettings.ts`, `getSiteSettingsSafe()`). `getRecipeOfTheWeek()` uses the pinned slug if published, else latest published. `PUT /api/admin/settings` validates and revalidates the layout.

## Key Files

| File | Purpose |
|---|---|
| `src/lib/site.ts` | Brand strings, SITE_URL, SOCIAL_LINKS, CONTENT_REPO, STORAGE_KEYS (`ar_mode`, `ar_favorites`), EASTER_EGGS |
| `src/lib/constants.ts`, `src/lib/collections.ts` | Taxonomy, badges, nav, collections |
| `src/lib/copy.ts` | Every line in her voice (DRAFT until approved) |
| `src/lib/theme.ts`, `src/lib/themeStore.ts`, `ThemeProvider.tsx`, `ThemeToggle.tsx` | Light / dark / system only |
| `src/styles/globals.css` | Tokens (`:root` + `.dark`), type utilities, `.note`, `.charm`, `.necklace`, `.placeholder`, `.squish-btn`, `.step-done`, drawer / sheet / overlay, `.prose`, print card |
| `src/lib/{mark,facts,oven,scale,kitchenTime,content,recipePool,og}.ts` | Mark geometry, facts line, oven table, scaler, kitchen-time slots, fixtures policy, shared reads, OG helpers |
| `src/components/brand/*` | Mark, Wordmark, Necklace, Note, Charm, Placeholder |
| `src/components/layout/{Header,NavDrawer (MenuSheet),SearchOverlay,Footer}.tsx` | Chrome |
| `src/components/home/*` | KitchenTime, Offering, CurrentlyCard, NewOutOfTheOven, CollectionsRow, ComeBackFor, StoriesTeaser, EmailLine, EmptyKitchen |
| `src/components/recipe/*` | RecipeCard, RecipeGrid, SaveButton, IngredientList, ServingsAdjuster, OvenLine, MethodSteps, CookModeToggle, InstagramCard (+ InstagramEmbed), ShareButtons, PrintButton, JumpToRecipe, CommentsSection, ExampleBanner, ViewPing |
| `src/components/lifestyle/StoryCard.tsx`, `src/components/shared/{Photo,SectionHeader,NewsletterForm,PageTransition,FaviconNod,InstagramIcon,BackToTop}.tsx`, `src/components/ui/*` | Shared pieces and primitives (Button/ButtonLink, Badge, FilterPill, Select, Input, StarRating, Skeleton, Modal, Chevron) |
| `src/lib/firebase/{recipes,lifestyle,subscribers,siteSettings,comments,messages,pageContent}.ts` | Admin-SDK data access with read-time defaults |
| `src/lib/validation.ts`, `src/lib/rateLimit.ts`, `src/lib/previewToken.ts`, `src/lib/revalidate.ts` | API boundary |
| `src/components/admin/{RecipeForm,LifestyleForm,ImageUpload,RichTextEditor,AdminBrand}.tsx`, `src/app/admin/*` | Admin |
| `scripts/{e2e-admin,snap,tells,gen-mark,gen-tokens,check-contrast}.mjs`, `scripts/design.config.mjs`, `src/lib/tokens.ts`, `src/lib/__tests__/*` | Gates and their one config; generated token hex |
| `HOW-TO-POST.md` | Ruks's ten-step guide to posting a bake (public-safe) |
| `firestore.rules`, `firestore.indexes.json`, `firebase.json` | Firestore config (deployed) |

## Firebase Services Status

- **Firestore**: enabled; rules deny all client access; indexes deployed.
- **Auth**: Google sign-in; `ADMIN_EMAIL` allow-list, comma-separated (`authCheck.ts`, `api/admin/verify`). Authorized domains: localhost, foodwithruks-site.firebaseapp.com, foodwithruks-site.web.app, foodwithruks.vercel.app (add the Vercel preview domain if the owner wants to sign in on a preview).
- **Storage**: not enabled (Blaze plan). Photos are committed to the GitHub repo instead.

## Known Issues / Follow-ups

- Firestore `siteSettings/pages.heroIntro` still holds the old sentence from the previous design (written back by an earlier e2e restore); it shows under the front-page bake until it is cleared or rewritten in /admin/pages. Claude does not write to Firestore.
- Every line in Ruks's voice is a draft (`grep -rn "DRAFT: needs Ruks" src`); she approves or rewrites before launch (launch gate in the redesign plan).
- The per-recipe OG card inlines the uploaded WebP; confirm it renders once the first real photo exists (fallback is the mark-only card).
- `npm run lint` passes with 5 pre-existing admin warnings (React Compiler rules on `loadRecipes` / `loadMessages`, admin `<img>`).
- The v3 design overhaul is in progress: four prototypes live in the git-ignored `redesign/prototypes-v3/` (build with `node redesign/prototypes-v3/tools/build.mjs`, serve with `node redesign/prototypes-v3/tools/serve.mjs`, shoot with `node redesign/prototypes-v3/shoot.mjs`); the owner and Ruks choose a direction before the re-skin (see `redesign/NOTES.md`).
- Automated screenshots in the hidden browser pane are stale after scrolling (harness limitation); `:focus` styles cannot be verified there.
- Dev-only hydration mismatch at the top of `<body>` on some routes under `next dev`; production is clean.

## Commands

```bash
npm run dev          # http://localhost:3000
npm run build        # production build
npm run lint
npm run typecheck
npm test             # node:test for facts, oven, scale, kitchenTime
npm run tells        # template tells, banned words and legacy colour aliases in public code (rules: scripts/design.config.mjs)
npm run contrast     # every colour pair in both modes (node scripts/check-contrast.mjs [some.css] checks another stylesheet)
npm run gen:tokens   # src/lib/tokens.ts from globals.css
npm run gen:mark     # regenerate src/app/icon.svg + public/icon-asleep.svg from src/lib/mark.ts
npm run snap <label> # gate screenshots + axe into .snapshots/<label>/ (needs a running server)
npm run e2e          # end-to-end admin -> site test against a running server
npx firebase-tools deploy --only firestore   # rules + indexes
```

---

_Claude Code: After completing any task, update "Current State", "Last Updated", "Last Task Completed", and any other relevant sections._
