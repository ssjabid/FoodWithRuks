# CLAUDE.md — Agooh & Ruks Project State

> This file is the single source of truth for Claude Code. Read before every task. Update after every completed task.

## Project

**Agooh & Ruks** (formerly FoodWithRuks) — a recipe and lifestyle blog for an Instagram food creator. Byline "Pass the Butter, Ruks". Taglines "Pure comfort, cooked simply" and "Warmth in every bite". Food that is easy to follow, wholesome, and full of flavour; plus days out, eating out, travel, parenting and crafts.

## Current State

**Phase**: Phase 10 — production audit: server-side validation, comments + ratings end to end, view counts, draft previews, RSS, hardened public forms, e2e test script
**Last Updated**: 2026-09-20
**Last Task Completed**: Production audit (branch `feat/production-audit`): every admin write goes through `src/lib/validation.ts` (whitelist, caps, enums, slug uniqueness 409, protected fields), public comments UI + moderation recomputes recipe ratings, view counter feeds Most loved, signed draft previews, `/feed.xml`, contact/comment honeypot + rate limit, `npm run e2e` exercises the whole admin → Firestore → public chain through the real routes (26 checks). Previously: rich-text editor (Tiptap 3) for lifestyle posts + About page, and editable page copy (`siteSettings/pages`: home intro, footer blurb, About title/subtitle/photo/body) via `/admin/pages`. Photo uploads are LIVE (token verified for real 2026-09-20). Previously: photo uploads (branch `feat/github-photos`): admin forms get an `ImageUpload` field (hero, per-step, lifestyle cover); the browser resizes to 1600/800px WebP, `POST /api/admin/upload` commits both files to the repo in one commit via the Git Data API, the public site renders real photos through `Photo` (plain `<img>` + srcset, placeholder fallback). Live test 2026-09-20: the fine-grained token (user ssjabid) committed two files in one commit to a throwaway branch and the raw preview served them; branch deleted. The token itself is never stored in the repo or memory. Needs `GITHUB_UPLOAD_TOKEN` in Vercel before the first upload. Previously: Ruks chose **Clay**. `DEFAULT_PALETTE = "clay"`, picker hidden by default, palette locked when the picker is hidden (stored visitor choices ignored), OG image / apple icon / icon.svg recoloured to Clay, admin private-key parsing hardened. Merged and LIVE 2026-09-20. The other four palettes remain in globals.css and in /admin/settings; re-enable the picker there to compare again. Page transitions + Appearance panel live since 2026-09-20.

## Live deployment (important)

- **Production**: https://foodwithruks.vercel.app — Vercel Git integration, **every push to `main` deploys to production**.
- Work on a branch; Vercel builds a preview per branch (URL on the commit's deployment status in GitHub; previews are behind Vercel login, so the account owner opens them). Merge to `main` only after the preview is verified.
- `foodwithruks.com` is NOT registered. `SITE_URL` (src/lib/site.ts) resolves `NEXT_PUBLIC_SITE_URL` → Vercel production URL → `https://foodwithruks.vercel.app`.
- Firestore rules + composite indexes are deployed (2026-09-07). Firestore is empty (0 recipes, 0 posts, no `siteSettings/general` doc as of 2026-09-20), so the public site shows sample content until recipes/posts are published in `/admin`.
- Local dev: `.env.local` has the service-account key pasted with a mix of escaped and real newlines; `admin.ts` normalises it. Scratch scripts that use the Admin SDK must do the same (see the inspection script pattern: `@next/env` loadEnvConfig + collapse newlines).

## Tech Stack

- Next.js 16 (App Router) + React 19 + TypeScript strict
- Tailwind CSS v4 (CSS-first `@theme` in `src/styles/globals.css`, no tailwind.config)
- Fonts: **Lora** (headings, italic accents) + **Inter** (body, eyebrows) via next/font, variables on `<html>`
- Firebase: Firestore via Admin SDK (server only), Auth (Google sign-in, client SDK auth only)
- **No animation library on the public site** (CSS transitions only). `framer-motion` is still installed for `/admin` only — do not import it in public components.
- Vercel hosting; react-social-media-embed (Instagram embed on recipe pages)

## Motion policy (personal-blog calm, research-backed)

- Only user-initiated, functional motion: drawer slide 220ms, overlay/backdrop fade 150ms, popover 150ms, accordion 200ms, `.fade-in` 120ms for swapped labels/status, hover/focus colour changes 150ms. Tokens: `--dur-fast`, `--dur-base`, `--dur-drawer`, `--dur-page`, `--ease-out`.
- **Page transitions** (`src/components/shared/PageTransition.tsx`, no library, no experimental flags): `PageEnter` wraps `{children}` in the root layout and replays `.page-enter` (280ms fade + 4px settle) when the pathname changes — never on first load (LCP) and never under `/admin`. `PageTransitionListener` (capture-phase click listener) sets `<html data-navigating>` for internal links to a *different* pathname so `main` softens to 50% until the new page commits (1.5s safety timeout). `beginPageTransition(href)` is called by HeroSearch/SearchOverlay for programmatic pushes. Same-page query/hash links (filters, jump links) do not transition. Add `data-no-transition` to a link to opt out.
- **Never** add: scroll-reveal / staggered entrances, card lift or photo zoom, button lift/fill wipes, bounces, pulses, progress bars, parallax. Hover on cards = title underline + image opacity 0.9.
- `prefers-reduced-motion: reduce` zeroes every transition/animation; smooth scroll only under `no-preference`.
- The old global `* { transition … }` rule is gone; the colour crossfade on theme change is scoped to `html.theme-transition` (added for 300ms by `ThemeProvider`).
- Tailwind default transition = 150ms ease-out (`@theme --default-transition-*`). Never use `transition-all`.

## Brand + Design System

- **Swatches**: clay `#C7A491`, blush `#EECFCA`, sage `#919682`, light sage `#C7CDBF`, olive `#595E48`.
- **Palettes** (`data-palette` on `<html>`, each with light + `.dark`): `clay` (**site default since 2026-09-20, Ruks's choice**), `cream` (Cream & Olive), `sage`, `blush`, `olive` (Evening Olive). Token sets live in `globals.css` (light blocks first, then `[data-palette].dark` blocks). 21 tokens each: primary, primary-hover, on-primary, secondary, accent, accent-soft, accent-text, background, surface, elevated, text-primary/secondary/tertiary, border, success, warning, error, placeholder-bg, placeholder-icon, band, on-band. Run `node scripts/check-contrast.mjs` after touching them.
- Rules: `--color-accent` is decorative only in light modes; text on clay/blush/sage tints uses `text-primary`; links use `--color-accent-text` or `--color-primary`; anything on a primary background uses `--color-on-primary`. No shadows anywhere (flat, hairline borders). Radii 6/8/12px.
- **Typography scale** (`:root` tokens + `@utility`): `h-display` (48–72px hero, Lora 500), `h-page` (36–48), `h-section` (26–32), `h-card` (18), `eyebrow` (12px Inter 500 uppercase 0.16em), `accent-italic` (Lora italic in accent-text), `text-body` (17px/1.65 article text). Body 16px/1.6. Headings weight 500.
- **Focus**: global `:focus-visible` 2px primary outline for keyboard (never sets `border-radius` — that squared off round buttons); inputs use `.field` (border darkens + 1px inset on focus, no glow) and `.field-bare` inside wrappers. Links use `.link` (underline that brightens on hover). Inputs/selects are 16px+ on mobile (iOS zoom); `input[type=search]` has native appearance removed.
- Containers: `max-w-wide` (1240px) for chrome/grids, `max-w-prose` (720px) for articles. Section rhythm `py-12 sm:py-16`; `SectionHeader` = eyebrow + heading + quiet "View all".

## Theming (visitor + admin)

- `src/lib/theme.ts` (PALETTES metadata incl. `shortLabel` + `preview.{light,dark}.{bg,text,primary,accent}`, ids, modes, guards) · `src/lib/themeStore.ts` (external store: localStorage `ar_palette` / `ar_mode`, `matchMedia` for system; migrates legacy `ar_theme`) · `ThemeProvider` (applies `data-palette` + `.dark`, exposes `useTheme()`).
- Pickers (`src/components/shared/ThemePicker.tsx`): `PaletteSwatches` (5 mini-page tiles: ground, headline bar, button pill, accent dot) + `ModeSwitch` (Light/Dark/System with icons) + `ThemePicker` (drawer "Appearance" accordion, **open by default**, inside the drawer's scroll area).
- **Header**: while `showThemePicker` is on, `ThemePanel` replaces the sun/moon toggle — a live conic swatch of the current palette (with a "new" dot until first opened, `ar_picker_seen`) that opens a popover (`.popover-panel`, transparent backdrop so the page recolours visibly behind it, Escape/focus trap/`inert`). When the picker is hidden, the plain `ThemeToggle` returns.
- Root layout reads `siteSettings/general.defaultPalette` (server) and renders `<html data-palette>` plus an inline no-FOUC script that applies the stored choice before paint.
- Admin `/admin/settings`: default palette + "show theme picker to visitors" (`siteSettings.showThemePicker`, **default false**). While the picker is hidden the palette is **locked**: `ThemeProvider` and the no-FOUC script ignore `ar_palette` and use the site default (`DEFAULT_PALETTE` in `theme.ts` = `clay`, or `siteSettings.defaultPalette` once that doc exists). Light/dark still follows the visitor.
- `opengraph-image.tsx` / `apple-icon.tsx` / `icon.svg` are hardcoded to the **clay** palette — update by hand if the default changes.

## Navigation

- Hamburger drawer at **all** breakpoints, slides from the **left** (`src/components/layout/NavDrawer.tsx`: always-mounted portal, `data-state` + `inert`, focus trap, Escape, `.accordion` groups, Appearance picker in the scrollable area (`overscroll-contain`), tagline + Instagram footer).
- Header (56px, sticky, hairline): hamburger left · Logo centre · search button + palette button (or theme toggle) right. Ctrl/Cmd+K opens `SearchOverlay` (routes to `/recipes?q=`).
- Nav tree (`NAV_TREE` in `src/lib/constants.ts`): Recipes ▸ Starters, Main Courses, Side Dishes, Desserts, Bread, Drinks, Baby Weaning · Lifestyle ▸ Days Out, Eating Out, Travel, Parenting, Craft & Hobbies · About Me · Newsletter · Contact.

## Taxonomy (src/lib/constants.ts)

- `RECIPE_CATEGORIES`: starters, mains ("Main Courses"), sides, snacks (not in nav), desserts, bread, drinks, baby-weaning. Type `RecipeCategory`.
- `MEAL_TYPES`: breakfast, brunch, lunch, dinner. Type `MealType`. **Only public recipe filter.**
- `WHAT_TO_EAT`: 10 boxes (Starters, Main Course, Side Dishes, Snacks, Breakfast, Dinner, Desserts, Drinks, Bread, Baby Weaning); each maps to `?category=` or `?mealType=`. `getCategoryCounts()` (src/lib/categoryCounts.ts) counts published recipes per box for the home list.
- `LIFESTYLE_CATEGORIES`: days-out, eating-out, travel, parenting, craft-hobbies (stored as slugs; `getLifestyleCategoryLabel` falls back to raw value for legacy docs).
- `DIETARY_TAGS`, `SPECIAL_OCCASIONS` remain in the data model + admin, not public filters.

## Pages

| Route | Notes |
|---|---|
| `/` | Hero (byline, "Pure comfort, *cooked simply*", tagline, search, Browse/About) + "New this week" featured recipe · Currently cooking (3) · Explore by category (list with counts) · Most loved (4 rows, hidden under 3) · Beyond the kitchen (3 posts) · Instagram band · Newsletter |
| `/recipes` | "What to eat?" compact grid, search, Meal Type pills, native `Select` sort, favourites. URL is source of truth (`q`, `category`, `mealType`). Suspense-wrapped. |
| `/recipes/[slug]` | Prose measure; Instagram embed beside hero when `instagramUrl` set; native ingredient checkboxes; `.accordion` nutrition; JSON-LD Recipe |
| `/lifestyle`, `/lifestyle/[slug]` | `?category=` deep links; flat cards |
| `/about` | Server page from `siteSettings/pages` (title, subtitle, portrait photo beside the text on desktop, HTML body via `.prose`) |
| `/contact` (server page + `ContactClient`), `/newsletter` (real form), `not-found` |
| `/shop` | Removed; permanent redirect to `/` in next.config.ts |
| `/admin/*` | Dashboard, recipes, lifestyle, **pages** (home intro, footer blurb, About), comments, messages, subscribers (CSV), settings (featured recipe, Instagram handle, default palette, picker toggle) |
| Metadata routes | `icon.svg`, `apple-icon.tsx`, `opengraph-image.tsx`, `robots.ts`, `sitemap.ts` (Firestore + sample fallback) |

## Photo uploads (GitHub as the image store)

- Photos are committed into the repo at `public/images/uploads/<folder>/<yyyy>/<mm>/<slug>-<id>-w<width>.webp` (folders: recipes, lifestyle, steps, misc) and served as static files by the next production deploy (every push to `main` redeploys, so a photo is live ~1–2 min after upload). Until then the admin previews it from `raw.githubusercontent.com` (`rawContentUrl()` in `site.ts`).
- Client: `src/lib/imageResize.ts` (`createImageBitmap` with EXIF orientation → canvas → WebP q0.82, widths `PHOTO_WIDTHS = [1600, 800]`) and `src/components/admin/ImageUpload.tsx` (choose/replace/remove, "paste a link" fallback, status line). Used in `RecipeForm` (hero + each step) and `LifestyleForm` (cover → new optional `LifestylePost.coverImage`).
- Server: `src/lib/github.ts` (`commitFiles()` = ref → commit → blobs → tree → commit → ref PATCH, retries once on 422 when the branch moved; `isUploadConfigured()`, `rawUrlFor()`) and `src/app/api/admin/upload/route.ts` (admin token check, validates data URLs and sizes, 503 when the token is missing). Env: `GITHUB_UPLOAD_TOKEN` (fine-grained PAT, only this repo, Contents read+write), `GITHUB_REPO`, `GITHUB_BRANCH`.
- Public rendering: `src/components/shared/Photo.tsx` — plain `<img loading=lazy>` (no Vercel image-optimisation quota), `srcset` derived from the `-w1600/-w800` naming, `ratio` (square/landscape/portrait) or `fit="natural"`, falls back to `FoodPlaceholder` when `src` is empty. Used by RecipeCard, FeaturedRecipe, MostLoved, LifestyleTeaser, LifestyleClient, LifestylePostClient, InstructionStep, RecipePageClient.
- Uploads from the admin move `main`; always `git pull --ff-only` before pushing. Repo growth: ~300 KB per photo pair.

## Editor + editable pages

- `src/components/admin/RichTextEditor.tsx`: Tiptap 3 (`@tiptap/react`, `starter-kit` with link, `extension-image`, `extension-placeholder`; `immediatelyRender: false`, toolbar state via `useEditorState`). Toolbar: Text/H2/H3, bold, italic, link (prompt), bullet/numbered list, quote, Photo (uploads through `/api/admin/upload`, inserts the raw GitHub preview URL), undo/redo. Output is HTML rendered by `.prose` (which now styles img/blockquote/strong/hr). Admin-only; do not import on the public site.
- Forms rewrite `rawContentUrl("public")` → "" on save so stored HTML uses site paths (`/images/uploads/...`).
- `LifestyleForm` uses the editor for `content` (reading time from stripped text). The old HTML textarea is gone.
- Page copy: `src/lib/firebase/pageContent.ts` (`DEFAULT_PAGE_CONTENT` = the original hardcoded copy; `getPageContentSafe()`), `PageContent` type, `GET/PUT /api/admin/pages` (per-field length caps, revalidates layout + /about), `/admin/pages` (hero intro, footer blurb, About title/subtitle/photo/body). Consumers: `page.tsx` → `HeroSection intro`, async `Footer`, `src/app/about/page.tsx` (AboutPageClient deleted).

## Content pipeline guarantees (audit 2026-09-20)

- **Validation at the API boundary** (`src/lib/validation.ts`): `normaliseRecipeInput` / `normalisePostInput` return a complete, safe payload: unknown fields dropped, strings trimmed + capped, enums checked against `constants.ts`, numbers coerced, ingredients/steps cleaned (blank rows removed, steps renumbered), slug derived from the title when empty, `rating`/`viewCount`/timestamps never settable. Errors are `ValidationError` → 400 with a human message the forms show. Slug collisions → 409. Reading time is computed server-side. `adminDb.settings({ ignoreUndefinedProperties: true })`; empty nutrition/seo are removed on update via `FieldValue.delete()`.
- **Comments + ratings**: `POST /api/comments` {recipeSlug, name, text, rating, website(honeypot)} → validates, looks the recipe up server-side (404 if not published), rate-limits 5/10 min per IP, stores `pending` with an `ipHash`. `CommentsSection` (recipe page) lists approved comments (`getApprovedComments`, index recipeSlug+status+createdAt desc — deployed) and hosts the form. Approving/unapproving/deleting in `/admin/comments` calls `recomputeRecipeRating` (average to 1dp + count from approved comments) and revalidates the recipe page, /recipes and /. `Comment.name` is new; older docs show "Reader".
- **Views**: `ViewPing` posts once per session to `POST /api/recipes/view` (1 per IP per slug per hour, `FieldValue.increment`). Feeds "Most loved" and the Popular sort. Skipped on draft previews.
- **Draft previews**: `/preview/{recipe|post}/{slug}/{token}` (`force-dynamic`, noindex; token = HMAC-SHA256 of type:slug with `REVALIDATION_SECRET`, `src/lib/previewToken.ts`). Admin forms have a Preview button (edit mode) that fetches `GET /api/admin/preview` and opens the link. Public pages are untouched (no searchParams, still ISR).
- **Public form hardening**: `src/lib/rateLimit.ts` (`rateLimited`, `clientIp`, `honeypotTripped`) used by comments and contact; contact validates lengths/email and reads the `website` honeypot the form already had.
- **RSS**: `/feed.xml` (recipes + stories, 40 newest, ISR 1h, sample fallback), advertised via `alternates.types` in the layout metadata. `robots.ts` also disallows `/preview`.
- **End-to-end test**: `npm run e2e` (`scripts/e2e-admin.mjs`) against a running server (`E2E_BASE_URL`, default localhost:3000). It creates a Firebase Auth user `e2e-admin@agoohandruks.test`, mints a custom token, exchanges it for an ID token and drives the real routes: auth refusal, validation 400s, create/duplicate 409/publish/delete recipe, public 404 vs 200, preview link + tampered token, home/sitemap/feed listing, view ping, comment honeypot/404/pending/approve → rating + public render, post create/409, contact + newsletter → admin inboxes, settings pin + pages edit (restored), upload guard. Everything it creates is deleted in `finally`. Locally the test address must be in `.env.development.local` (`ADMIN_EMAIL=...,e2e-admin@agoohandruks.test`, git-ignored). Do not add it to the Vercel allow-list.

## Newsletter

- `POST /api/newsletter` → Firestore `subscribers` (doc id = normalised email; honeypot `website`; best-effort rate limit; always `{ok:true}` on success/duplicate).
- `NewsletterForm` variants inline (home), compact (footer), stacked (/newsletter). Admin: `/admin/subscribers`, CSV export, count in stats.

## Site settings

- Firestore `siteSettings/general` `{ recipeOfTheWeekSlug, instagramHandle, defaultPalette, showThemePicker, updatedAt }` (`src/lib/firebase/siteSettings.ts`, `getSiteSettingsSafe()` for the layout).
- `getRecipeOfTheWeek()` uses the pinned slug if published, else latest published. `PUT /api/admin/settings` validates and calls `revalidatePath("/", "layout")`.
- Admin create/update/delete routes call `revalidatePath` for `/`, `/recipes` or `/lifestyle`, the item page and `/sitemap.xml`.

## Key Files

| File | Purpose |
|---|---|
| `src/lib/site.ts` | Brand strings, SITE_URL resolution, SOCIAL_LINKS, STORAGE_KEYS (`ar_palette`, `ar_mode`, `ar_favorites`) |
| `src/lib/constants.ts` | Taxonomy, WHAT_TO_EAT, NAV_TREE, label/guard helpers |
| `src/lib/theme.ts`, `src/lib/themeStore.ts` | Palette metadata + client theme store |
| `src/styles/globals.css` | Tokens, 10 palette sets, motion/focus/field/link rules, type utilities, drawer/accordion CSS, print |
| `src/components/layout/{Header,NavDrawer,SearchOverlay,Footer}.tsx` | Site chrome |
| `src/components/shared/{ThemeProvider,ThemePicker,ThemePanel,ThemeToggle,PageTransition,SectionHeader,NewsletterForm,FoodPlaceholder}.tsx` | Shared |
| `src/components/ui/{Button (+ButtonLink, buttonClasses),Card,Badge,FilterPill,Select,Chevron,Input,Logo,Modal,Skeleton,StarRating}.tsx` | Primitives (no motion) |
| `src/components/home/*` | HeroSection + HeroSearch + FeaturedRecipe, CurrentlyCooking, ExploreByCategory, MostLoved, LifestyleTeaser, InstagramBlock, NewsletterSection |
| `src/lib/firebase/{recipes,lifestyle,subscribers,siteSettings,comments,messages}.ts` | Admin-SDK data access |
| `src/lib/github.ts`, `src/app/api/admin/upload/route.ts`, `src/lib/imageResize.ts`, `src/components/admin/ImageUpload.tsx`, `src/components/shared/Photo.tsx` | Photo uploads (GitHub) + rendering |
| `src/components/admin/RichTextEditor.tsx`, `src/lib/firebase/pageContent.ts`, `src/app/api/admin/pages/route.ts`, `src/app/admin/pages/page.tsx` | Editor + editable page copy |
| `src/lib/validation.ts`, `src/lib/rateLimit.ts`, `src/lib/previewToken.ts` | API boundary: input normalisation, public-form limits, signed previews |
| `src/components/recipe/{CommentsSection,ViewPing}.tsx`, `src/app/api/comments/route.ts`, `src/app/api/recipes/view/route.ts`, `src/app/preview/[type]/[slug]/[token]/page.tsx`, `src/app/feed.xml/route.ts` | Comments, views, previews, RSS |
| `scripts/e2e-admin.mjs` | End-to-end admin → site test (`npm run e2e`) |
| `scripts/check-contrast.mjs` | Contrast gate for every palette × mode |
| `firestore.rules`, `firestore.indexes.json`, `firebase.json` | Firestore config (deployed) |

## Firebase Services Status

- **Firestore**: enabled; rules deny all client access; indexes deployed.
- **Auth**: Google sign-in; `ADMIN_EMAIL` allow-list, **comma-separated** (`authCheck.ts`, `api/admin/verify`). Verified 2026-09-20: Google provider enabled; authorized domains = localhost, foodwithruks-site.firebaseapp.com, foodwithruks-site.web.app, foodwithruks.vercel.app. Local `.env.local` lists two emails; the **Vercel** `ADMIN_EMAIL` must list the same (only the account owner can check).
- **Storage**: not enabled (Blaze plan). Photos are committed to the GitHub repo instead (see Photo uploads). `FoodPlaceholder` remains the fallback when a document has no photo.

## Known Issues / Follow-ups

- Public comments are live (pending → approve in /admin/comments). Ratings only come from approved comments.
- Photo uploads are live (`GITHUB_UPLOAD_TOKEN` set on Vercel).
- `framer-motion` still bundled for `/admin` only; convert admin to CSS and `npm uninstall` later.
- `npm run lint` passes with ~8 warnings (React Compiler rules downgraded to warn); `RecipesClient` still syncs input state from the URL in an effect.
- Automated screenshots in the hidden browser pane are stale after scrolling (harness limitation, not a site bug); `:focus` styles cannot be verified there because the document lacks focus.
- Suspense fallbacks on /recipes and /lifestyle mirror the real page header + container so there is no jump when the client component mounts.
- Admin routes still get the public Header/Footer from the root layout (pre-existing); page transitions deliberately skip `/admin`.
- Dev-only: `next dev` logs a hydration mismatch at the top of <body> on some routes (/contact, /about) while home, /recipes and /newsletter are clean; production shows no console errors on the same routes (checked 2026-09-20). Ignore unless it appears in production.

## Commands

```bash
npm run dev          # http://localhost:3000
npm run build        # production build
npm run lint
npm run typecheck
node scripts/check-contrast.mjs
npx firebase-tools deploy --only firestore   # rules + indexes
npm run e2e          # end-to-end admin -> site test against a running server (see Content pipeline guarantees)
```

---

_Claude Code: After completing any task, update "Current State", "Last Updated", "Last Task Completed", and any other relevant sections._
