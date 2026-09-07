# CLAUDE.md — Agooh & Ruks Project State

> This file is the single source of truth for Claude Code. Read before every task. Update after every completed task.

## Project

**Agooh & Ruks** (formerly FoodWithRuks) — a recipe and lifestyle blog for an Instagram food creator. Byline "Pass the Butter, Ruks". Taglines "Pure comfort, cooked simply" and "Warmth in every bite". Food that is easy to follow, wholesome, and full of flavour; plus days out, eating out, travel, parenting and crafts.

## Current State

**Phase**: Agooh & Ruks revamp complete (rebrand, palette, fonts, hamburger nav, home + recipes rebuild, newsletter backend, admin settings, SEO routes, Firestore rules/indexes)
**Last Updated**: 2026-09-07
**Last Task Completed**: Revamp merged to `main` and LIVE at https://foodwithruks.vercel.app (2026-09-07). Firestore rules + indexes deployed. Firestore is empty, so sample content shows until recipes/posts are published in /admin.

## Live deployment (important)

- **Production**: https://foodwithruks.vercel.app — Vercel Git integration, **every push to `main` deploys to production**.
- Work on a branch; Vercel builds a preview per branch (URL on the commit's deployment status in GitHub). Merge to `main` only after the preview is verified.
- `foodwithruks.com` is NOT registered. `SITE_URL` (src/lib/site.ts) resolves `NEXT_PUBLIC_SITE_URL` → Vercel production URL → `https://foodwithruks.vercel.app`.
- Firestore composite indexes must be deployed (`npx firebase-tools deploy --only firestore`) or public pages silently fall back to sample data (errors are logged).

## Tech Stack

- Next.js 16 (App Router) + React 19 + TypeScript strict
- Tailwind CSS v4 (CSS-first `@theme` in `src/styles/globals.css`, no tailwind.config)
- Fonts: **Lora** (headings, italic byline) + **Inter** (body) via next/font, variables on `<html>`
- Firebase: Firestore via Admin SDK (server only), Auth (Google sign-in, client SDK auth only)
- Framer Motion
- Vercel hosting
- react-social-media-embed (Instagram embed on recipe pages)

## Brand + Design System

- **Palette "Warm Sage & Clay"** (swatches: clay `#C7A491`, blush `#EECFCA`, sage `#919682`, light sage `#C7CDBF`, olive `#595E48`)
  - Light: primary `#595E48` (olive, 6.7:1 on white), on-primary white, accent `#C7A491` (decorative only), accent-soft `#EECFCA`, accent-text `#8F624B` (clay for text, AA), background `#FCFBF8`, surface `#F5F3EE`, elevated white, text `#2A2D22` / `#595E48` / `#6E7362`, border `#DDE1D6`
  - Dark: primary `#C7CDBF` (light sage), on-primary `#1B1D17`, background `#1B1D17`, surface `#22251D`, elevated `#2B2F25`, text `#F1EEE7` / `#B9BDAF` / `#868B7B`
  - Rule: `#919682` sage fails AA on white — icons, borders, large text only. Never white text on clay.
  - Tokens live ONCE in `:root` / `.dark`; `@theme` holds radii/spacing/shadows; `@theme inline` holds fonts. Buttons on primary use `text-[var(--color-on-primary)]`, never `text-white`.
- **Typography**: headings Lora 600 (`font-semibold`, no 800 weight exists), body Inter 400–500. `font-heading` / `font-body` utilities.
- **Logo**: "Agooh & Ruks" in Lora, ampersand in `--color-accent-text`; optional byline. `src/components/ui/Logo.tsx`.
- Spacing/containers unchanged: `max-w-6xl`, `py-16 sm:py-20`, cards `p-4`, pills `h-9`, CTAs `h-11`.

## Navigation

- Hamburger drawer at **all** breakpoints, slides from the **left** (`src/components/layout/NavDrawer.tsx`, portal to body, focus trap, Escape, accordion groups).
- Header: hamburger left · Logo centre · search button + theme toggle right. Ctrl/Cmd+K opens `SearchOverlay` (routes to `/recipes?q=`).
- Nav tree (`NAV_TREE` in `src/lib/constants.ts`): Recipes ▸ Starters, Main Courses, Side Dishes, Desserts, Bread, Drinks, Baby Weaning · Lifestyle ▸ Days Out, Eating Out, Travel, Parenting, Craft & Hobbies · About Me · Newsletter · Contact.

## Taxonomy (src/lib/constants.ts)

- `RECIPE_CATEGORIES`: starters, mains ("Main Courses"), sides, snacks (not in nav), desserts, bread, drinks, baby-weaning. Type `RecipeCategory`.
- `MEAL_TYPES`: breakfast, brunch, lunch, dinner. Type `MealType`. **Only public recipe filter.**
- `WHAT_TO_EAT`: 10 boxes (Starters, Main Course, Side Dishes, Snacks, Breakfast, Dinner, Desserts, Drinks, Bread, Baby Weaning); each maps to `?category=` or `?mealType=`.
- `LIFESTYLE_CATEGORIES`: days-out, eating-out, travel, parenting, craft-hobbies (stored as slugs; `getLifestyleCategoryLabel` falls back to raw value for legacy docs).
- `DIETARY_TAGS`, `SPECIAL_OCCASIONS` remain in the data model + admin, not public filters.

## Pages

| Route | Notes |
|---|---|
| `/` | Hero (byline, wordmark, tagline, search), Recipe of the Week, What to eat grid, Fresh from the kitchen (3), Beyond the kitchen (3 posts), Instagram block, newsletter |
| `/recipes` | "What to eat?" grid, search, Meal Type pills, sort, favourites. URL is source of truth (`q`, `category`, `mealType`). Suspense-wrapped. |
| `/recipes/[slug]` | Instagram embed beside hero when `instagramUrl` set; JSON-LD Recipe with publisher |
| `/lifestyle`, `/lifestyle/[slug]` | `?category=` deep links |
| `/about`, `/contact` (server page + `ContactClient`), `/newsletter` (real form) |
| `/shop` | Removed; permanent redirect to `/` in next.config.ts |
| `/admin/*` | Dashboard, recipes, lifestyle, comments, messages, **subscribers** (CSV export), **settings** |
| Metadata routes | `icon.svg`, `apple-icon.tsx`, `opengraph-image.tsx` (fetches Lora, falls back), `robots.ts`, `sitemap.ts` (Firestore + sample fallback) |

## Newsletter

- `POST /api/newsletter` → Firestore `subscribers` (doc id = normalised email, so no duplicates; honeypot field `website`; best-effort rate limit; always `{ok:true}` on success/duplicate).
- `NewsletterForm` (`src/components/shared/NewsletterForm.tsx`) variants inline (home), compact (footer), stacked (/newsletter).
- Admin: `/admin/subscribers`, `GET /api/admin/subscribers[?format=csv]`, `DELETE /api/admin/subscribers/[id]`, count in `/api/admin/stats`.

## Site settings

- Firestore `siteSettings/general` `{ recipeOfTheWeekSlug, instagramHandle, updatedAt }` (`src/lib/firebase/siteSettings.ts`).
- `getRecipeOfTheWeek()` uses the pinned slug if published, else latest published.
- `/admin/settings` + `PUT /api/admin/settings` (validates slug, revalidates `/`).
- Admin create/update/delete routes call `revalidatePath` for `/`, `/recipes` or `/lifestyle`, the item page and `/sitemap.xml`.

## Key Files

| File | Purpose |
|---|---|
| `src/lib/site.ts` | Brand: SITE_NAME, byline, taglines, SITE_URL resolution, SOCIAL_LINKS (Instagram @foodwithruks), STORAGE_KEYS |
| `src/lib/constants.ts` | Taxonomy, WHAT_TO_EAT, NAV_TREE, label/guard helpers |
| `src/styles/globals.css` | Tokens (light/dark), fonts, animations, print |
| `src/components/layout/{Header,NavDrawer,SearchOverlay,Footer}.tsx` | Site chrome |
| `src/components/recipe/WhatToEatGrid.tsx` | Category/meal boxes (home + recipes) |
| `src/app/recipes/RecipesClient.tsx` | URL-synced filtering |
| `src/lib/firebase/{recipes,lifestyle,subscribers,siteSettings,comments,messages}.ts` | Admin-SDK data access |
| `src/lib/favorites.ts` | localStorage favourites + `favorites-changed` event |
| `firestore.rules`, `firestore.indexes.json`, `firebase.json` | Firestore config (deploy with firebase-tools) |
| `README.md` | Setup + deploy guide |

## Firebase Services Status

- **Firestore**: enabled. Rules in repo deny all client access (all access is Admin SDK). Indexes in repo; deploy them.
- **Auth**: Google sign-in; `ADMIN_EMAIL` comma-separated allow-list checked server-side (`verifyAdminRequest`). Authorized domains must include the Vercel host.
- **Storage**: not enabled (Blaze plan). Image fields are URL text inputs. `FoodPlaceholder` used site-wide.

## Known Issues / Follow-ups

- Firestore indexes need deploying to production before real recipes display (see README).
- Public comments UI still not built (API + moderation exist).
- Real images await Firebase Storage.
- Instagram handle in `siteSettings` is stored for reference; public links use `SOCIAL_LINKS` in `src/lib/site.ts`.
- `npm run lint` (eslint flat config) passes with ~21 warnings: React Compiler rules (set-state-in-effect, immutability, refs) are downgraded to warn for pre-existing patterns; clean up incrementally.
- Framer Motion animations require requestAnimationFrame; automated screenshots in hidden panes appear blank (not a site bug).

## Commands

```bash
npm run dev          # http://localhost:3000
npm run build        # production build
npm run lint
npx tsc --noEmit
npx firebase-tools deploy --only firestore   # rules + indexes
```

---

_Claude Code: After completing any task, update "Current State", "Last Updated", "Last Task Completed", and any other relevant sections._
