# Agooh & Ruks — Project Instructions

## Project Overview

**Agooh & Ruks** is Ruks's recipe site: bakes first, some cooking, and the odd story. The design idea is **a care package from Ruks**. The home page hands you a bake; the recipe is the note inside; every tool (the scaler, the oven line, cook mode, the print card) looks after the reader.

- **Name**: Agooh & Ruks
- **Byline**: Pass the Butter, Ruks
- **Primary social**: Instagram @foodwithruks
- **Voice**: hers. Every line written for her is `// DRAFT: needs Ruks` until she approves it. British spelling, sentence case, dates like "26 September 2026". Halal-conscious defaults. No AI images.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) + React 19 + TypeScript strict |
| Styling | Tailwind CSS v4 (CSS-first) + semantic tokens in `src/styles/globals.css` |
| Fonts | Lora (display, headings), Inter (text), Kalam (her handwriting, `.note`), all via `next/font/google` |
| Motion | CSS only on the public site, within a fixed ceiling (see below). `framer-motion` lingers in a few `/admin` pages only. |
| Database | Firebase Firestore (Admin SDK, server only) |
| Auth | Firebase Auth (Google sign-in) for the admin |
| Photos | Resized in the browser, committed to this repo under `public/images/uploads` |
| Hosting | Vercel (Git integration; `main` = production) |
| Tests | `node:test` for the small libraries, Playwright + axe for gate screenshots, an end-to-end admin script |

---

## Design principles

1. **"Here, I made you something."** The first thing on the home page is a bake, its name and her line, not a hero slogan.
2. **Crisp outside, soft inside.** Sharp type, hairlines, flat chrome; blush, handwriting and the squish mark carry the warmth.
3. **One or two rings on.** Gold appears at most twice per screen, as shapes (the necklace pendant, a selected charm), never as text. Every gold element carries `data-gold` so the screenshot script can count them.
4. **Alive, not animated.** The Squish on save, one page fade, state changes under 220ms. Nothing moves on scroll.
5. **Real over generic.** No stock photos, no invented quotes, no placeholder text presented as hers. An honest placeholder says "photo coming".

### Colour (one palette, two modes)

Tokens live on `:root` (Daylight) and `.dark` (After hours). The device decides the mode by default; the header toggle overrides per visitor. There is no palette picker.

| Token | Daylight | After hours | Use |
|---|---|---|---|
| `--color-ground` | #FFFAF8 | #1E1614 | the page |
| `--color-surface` / `--color-elevated` | #F8EFEC / #FFFFFF | #2A201D / #342925 | bands, cards, fields / panels |
| `--color-text` / `-2` / `-3` | #2B1E1B / #5E4843 / #7A625C | #FBEFEB / #D9C3BD / #B39B94 | cocoa text |
| `--color-blush` (+ `on-blush`) | #EECFCA | #4A2F30 | the signature: Currently card, charms, cheeks. Never text. |
| `--color-cheek` / `-hover` (+ `on-cheek`) | #9E3A53 / #85304A | #F2A5B6 / #F7BCC9 | links, buttons, focus, selected |
| `--color-gold` | #B08A3C | #D9B56A | jewellery only, two per screen |
| `--color-clay` | #C7A491 | #C7A491 | hairlines, strokes, the parcel tag. Never text. |
| `--color-line` / `-strong` | #EBDAD4 / #D9C2BA | #3E302C / #55433E | dividers / borders that must be seen |
| `--color-sage` / `-ink` / `-soft` | #919682 / #56604A / #E6E9E0 | #AEB89F / … | outdoor content only (Trail-tested) |
| `--color-success`, `--color-error`, `--color-warning-bg` | | | status |

`node scripts/check-contrast.mjs` verifies text ≥ 7:1 on the ground, secondary text and interactive colours ≥ 4.5:1, gold ≥ 3:1, in both modes. Legacy aliases (`--color-primary`, `--color-text-primary`, `--color-border`, …) stay defined for the admin only. Never hardcode hex in public components; `src/lib/og.ts` (generated images) is the exception and mirrors the Daylight tokens.

### Type

- `h-display` 40–64px (the bake's name), `h-page` 32–44, `h-section` 24–30, `h-card` 20, all Lora 500.
- Body Inter 16px/1.6; `text-body` 17px/1.65 for recipe text and stories; `.prose` for editor HTML.
- `.note` Kalam 22px for her handwriting (`Note` component: real text, never essential information, one or two per screen, `tilt` at most once).
- Sentence case everywhere. Banned: eyebrows, uppercase labels, an italic accent word, middle-dot metas ("4 servings · 40 min" becomes "Serves 4. About 40 minutes."), arrows on links, keyboard-shortcut hints, bracket counts. `npm run tells` fails on them and on a list of banned words.

### Brand parts (`src/components/brand/`)

- **Mark**: the squish, a round bake with closed smiling eyes, rosy cheeks and a bite out of the top right. States `squished` (resting face), `open`, `asleep` (easter eggs only). Variants `single` (logo, favicon) and `pair` (About placeholder, 404 with `crumbs`). Geometry in `src/lib/mark.ts`; `npm run gen:mark` writes the static SVGs.
- **Wordmark**: "Agooh & Ruks" with the ampersand in cheek.
- **Necklace**: a hairline with one gold pendant; one or two per page, never inside cards.
- **Charm**: badge chips (First try, Travels well, Little helpers, Trail-tested in sage, Make ahead, Taste-tester's pick) with tiny line icons; each links to its collection. As a filter it is a `button` with `aria-pressed` and a gold ring when selected.
- **Placeholder**: the honest "photo coming" frame; `Photo` renders it whenever `src` is empty.

### Motion ceiling

| What | Duration |
|---|---|
| The Squish on save (`.squish-btn[data-squish]`) | 360ms, once, reduced motion = instant |
| Page fade on client navigation (`PageEnter`) | 280ms, never on first load, never under `/admin` |
| Menu sheet / overlay | 220ms / 150ms |
| State changes, `.fade-in`, hover colour | 120–200ms |

No scroll reveals, entrances, card lifts, photo zooms, pulses or progress bars. Hover on a card = title underline + image opacity 0.9. `prefers-reduced-motion` zeroes everything.

### Surfaces and controls

Flat: no shadows, hairline borders, radii 6/8/12px. Buttons and fields are round (`rounded-full`), 48px tall on phones, every target ≥ 44px. Focus = 2px cheek outline. `.field` / `.field-bare` for inputs, `.link` / `.link-cheek` for text links.

---

## Site Architecture

### Navigation
Header (56px, sticky): Wordmark, visible nav **Bakes · Cooking · Stories · About** from 768px (Cooking hides while nothing is published in that group), search, light/dark toggle, and a menu button below 768px that opens a top sheet (nav + Say hello + New bakes by email). Footer: Necklace, "Baked by Ruks. Tested by Agooh.", her footer line, links (+ Privacy), Instagram, RSS.

### Public pages

- **Home `/`**: kitchen-time line → (production, empty database: the honest empty state) → the **Offering** (photo, the bake's name, her handwritten line, the facts line, "Get the recipe") → **New out of the oven** + the blush **Currently** card → collections row → "The ones people come back for" (only with real data) → Stories → Instagram link + newsletter line.
- **Recipes `/recipes`, `/bakes`, `/cooking`**: group tabs, category chips, charm filters, Saved, sort Newest / Quickest, search. URL = state (`group`, `category`, `badge`, `sort`, `q`).
- **Recipe `/recipes/[slug]`**: photo, name, note, charms, facts line, Jump to recipe + Save (the squish), a short story, ingredients with the scaler and fraction glyphs, the oven line, tappable method + cook mode (Wake Lock), keeps / tips / verdicts / inspired by, click-to-load Instagram, print card, comments (average from 3 ratings), More like this. JSON-LD Recipe.
- **Collections `/collections/[slug]`**: filters over the published list; care packages carry "How to pack a tin"; Trail-tested is sage; empty ones are never linked.
- **Stories `/lifestyle`, `/lifestyle/[slug]`**, **About**, **Say hello `/contact`** (subject pre-fill from `?subject=`), **New bakes by email `/newsletter`**, **Privacy**, 404 ("Someone's eaten this page."), the hidden **`/bakery`** waitlist (404 + noindex until switched on in settings).

### Admin (`/admin`, Google sign-in, `ADMIN_EMAIL` allow-list)
Dashboard (Currently card first) · Recipes (yield kind and noun, oven, extra time, photo descriptions, "The personal bits") · Stories · Pages (Currently, front-page line, footer line, About) · Comments · Subscribers (CSV) · Messages · Settings (front-page bake, her line, lead collection, Instagram handle, bakery switch). Mutations revalidate the affected public pages.

---

## Data Models (Firestore)

```
recipes/{id}
  title, slug, description, personalStory, instagramUrl?
  category: RecipeCategory[]   // grouped: bakes | cooking | little-ones (see constants.ts)
  mealType[], tags[], dietaryTags[], specialOccasion[]
  prepTime, cookTime, extraTime? {minutes, label} | null
  servings, yieldKind: serves|makes, yieldNoun? {one, other}
  oven? {tempC, fan} | null
  ruksNote?, badges: BadgeId[], verdicts? {tasteTester?, agooh?}, inspiredBy?, keeps?
  difficulty, ingredients[{id, amount, unit, name, group?}], instructions[{step, text, image?, imageAlt?}]
  heroImage, heroImageAlt?, tips, nutrition?, seo?
  status: draft|published, featured, rating{average,count}, viewCount
  createdAt, updatedAt, publishedAt?

lifestylePosts/{id}
  title, slug, excerpt, content (HTML), coverImage?, coverImageAlt?
  category: LifestyleCategory, readingTime, status, createdAt, updatedAt, publishedAt

subscribers/{normalisedEmail}
  email, source: home|footer|newsletter-page|bakery, status, createdAt

siteSettings/general   recipeOfTheWeekSlug, instagramHandle, heroNote, activeCollection, showBakery, updatedAt
siteSettings/pages     heroIntro, footerBlurb, aboutTitle, aboutSubtitle, aboutBody, aboutPhoto, aboutPhotoAlt,
                       currently {baking, craving, lastWalk, latestParcel, updatedAt}, updatedAt
comments/{id}, contactMessages/{id}
```

Every new field is optional with a read-time default (`docToRecipe` and friends), so older documents need no migration. Composite indexes are in `firestore.indexes.json`; rules deny all client access.

---

## SEO
- Metadata API on every page; `metadataBase` = `SITE_URL`; canonical `alternates` on the main pages.
- `icon.svg`, `apple-icon.tsx`, `opengraph-image.tsx`, per-recipe `recipes/[slug]/opengraph-image.tsx` (photo + name, mark fallback).
- `robots.ts` (disallows /admin, /api, /preview, /bakery), `sitemap.ts` and `feed.xml` list real published content only, plus non-empty collections.
- JSON-LD Recipe on recipe pages (`recipeYield` from `facts.ts`, ISO durations including extra time, `aggregateRating` only with ≥3 real ratings). The production example bake is `noindex` and carries no JSON-LD.

---

## Key Technical Decisions

1. Server Components by default; client components only for interactivity.
2. All Firestore access via the Admin SDK; the client SDK is auth-only.
3. The URL is the source of truth for index filters (shareable, back-button friendly, Suspense-wrapped).
4. Brand strings in `src/lib/site.ts`; taxonomy, badges and nav in `src/lib/constants.ts`; collections in `src/lib/collections.ts`; every line in her voice in `src/lib/copy.ts`.
5. Fixtures (`src/lib/sampleData.ts`) are development furniture: six example bakes in development and preview deployments, exactly one labelled example in production, none once a real recipe exists (`src/lib/content.ts`).
6. Newsletter stored in Firestore (no third-party ESP); the admin exports CSV.
7. Photos live in the repo (no Storage, no image-optimisation quota); `Photo` renders plain `<img>` with a srcset.
8. Saved recipes in `localStorage` (`ar_favorites`) with a change event; light/dark in `ar_mode`.

---

## File Structure (key paths)
```
src/
├── app/
│   ├── layout.tsx (fonts, ThemeProvider, no-FOUC mode script, skip link, chrome), page.tsx, not-found.tsx
│   ├── sitemap.ts, robots.ts, icon.svg, apple-icon.tsx, opengraph-image.tsx, feed.xml/
│   ├── recipes/ (page.tsx, RecipesClient.tsx, [slug]/{page,RecipePageClient,opengraph-image}.tsx), bakes/, cooking/, collections/[slug]/
│   ├── lifestyle/ (page.tsx, LifestyleClient.tsx, [slug]/), about/, contact/, newsletter/, privacy/, bakery/, preview/
│   ├── admin/ (layout, dashboard, recipes, lifestyle, pages, comments, messages, subscribers, settings, login)
│   └── api/ (newsletter, contact, comments, recipes/view, revalidate, admin/*)
├── components/
│   ├── brand/ (Mark, Wordmark, Necklace, Note, Charm, Placeholder)
│   ├── layout/ (Header, NavDrawer = MenuSheet, SearchOverlay, Footer)
│   ├── home/ (KitchenTime, Offering, CurrentlyCard, NewOutOfTheOven, CollectionsRow, ComeBackFor, StoriesTeaser, EmailLine, EmptyKitchen)
│   ├── recipe/ (RecipeCard, RecipeGrid, SaveButton, IngredientList, ServingsAdjuster, OvenLine, MethodSteps, CookModeToggle, InstagramCard, InstagramEmbed, ShareButtons, PrintButton, JumpToRecipe, CommentsSection, ExampleBanner, ViewPing)
│   ├── lifestyle/ (StoryCard), shared/ (Photo, SectionHeader, NewsletterForm, ThemeProvider, ThemeToggle, PageTransition, FaviconNod, InstagramIcon, BackToTop)
│   ├── admin/ (AdminBrand, RecipeForm, LifestyleForm, ImageUpload, RichTextEditor)
│   └── ui/ (Button + ButtonLink, Badge, Input, FilterPill, Select, Chevron, Modal, Skeleton, StarRating)
├── hooks/ (useDebounce, useIsClient, useAuth)
├── lib/ (site, constants, collections, copy, theme, themeStore, mark, facts, oven, scale, kitchenTime, content, recipePool, og, favorites, utils, adminFetch, validation, rateLimit, previewToken, revalidate, github, imageResize, firebase/*, __tests__/*)
├── styles/globals.css
└── types/index.ts
scripts/ (e2e-admin, snap, tells, gen-mark, check-contrast) · firestore.rules · firestore.indexes.json · firebase.json
```
