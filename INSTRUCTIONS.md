# Agooh & Ruks — Project Instructions

## Project Overview

**Agooh & Ruks** is the recipe and lifestyle blog of Ruks, an Instagram food creator. The energy is "food made with love": recipes that are easy to follow and wholesome, food for your soul, and the joy of cooking and devouring food with flavour. Beyond the kitchen it covers days out, eating out, travel, parenting and crafts.

- **Name**: Agooh & Ruks
- **Byline**: Pass the Butter, Ruks
- **Taglines**: "Pure comfort, cooked simply" (hero) · "Warmth in every bite" (secondary)
- **Primary social**: Instagram @foodwithruks

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) + React 19 + TypeScript strict |
| Styling | Tailwind CSS v4 (CSS-first) + design tokens in `src/styles/globals.css` |
| Fonts | Lora (headings, italic accents) + Inter (body, eyebrows), `next/font/google` |
| Animation | CSS transitions only on the public site (120–220ms, ease-out). `framer-motion` remains for `/admin` only. |
| Database | Firebase Firestore (Admin SDK, server only) |
| Auth | Firebase Auth (Google sign-in) for the admin CMS |
| Hosting | Vercel (Git integration; `main` = production) |
| Embeds | react-social-media-embed (Instagram) |

---

## Design Philosophy — calm editorial

A personal food blog, not a product site. Research (NN/g on animation duration and scroll fading, Feast Design Co's food-blog guidance, and a DOM audit of Pinch of Yum, Smitten Kitchen, Minimalist Baker, Half Baked Harvest and Cookie + Kate) says: no scroll-reveal, no card lift or photo zoom, no running animations, colour-only transitions, serif headings, body text 16–18px, flat chrome that gets out of the way of the food. The layout reference Ruks likes is moribyan.com: slim sticky header, display serif headline with an italic accent word, uppercase eyebrow labels, wide 1240px grid, square flat images, sections such as "Currently cooking", "Explore by category" (with counts) and "Most loved".

**In practice**
- Motion is functional only: drawer slide (220ms), overlay fades (150ms), accordions (200ms), `.fade-in` for swapped labels (120ms), hover/focus colour changes (150ms). `prefers-reduced-motion` disables all of it.
- Hover on cards = title underline + image opacity 0.9. Links underline. Buttons change colour only.
- Flat: no shadows, hairline `--color-border` dividers, radii 6/8/12px.
- Generous but not empty: sections `py-12 sm:py-16`, `max-w-wide` (1240px) grids, `max-w-prose` (720px) articles.

### Colour System — five palettes from one set of swatches

Swatches: clay `#C7A491` · blush `#EECFCA` · sage `#919682` · light sage `#C7CDBF` · olive `#595E48`

| Palette (`data-palette`) | Character |
|---|---|
| `cream` — Cream & Olive (default) | Warm cream ground, olive type and buttons, clay and blush accents |
| `sage` | Light sage everywhere, olive type, clay links (the most palette-true) |
| `blush` | Soft pink ground and surfaces, olive buttons, clay links |
| `clay` | Clay buttons and links, light-sage sections, blush callouts |
| `olive` — Evening Olive | Sage ground with deep olive bands; dark mode is olive itself |

Each palette has a light block and a `[data-palette].dark` block in `globals.css` with the same 21 tokens (`primary`, `primary-hover`, `on-primary`, `secondary`, `accent`, `accent-soft`, `accent-text`, `background`, `surface`, `elevated`, `text-primary`, `text-secondary`, `text-tertiary`, `border`, `success`, `warning`, `error`, `placeholder-bg`, `placeholder-icon`, `band`, `on-band`). `node scripts/check-contrast.mjs` verifies text ≥ 7:1 / secondary ≥ 4.5:1 / buttons and links ≥ 4.5:1 for every set.

Rules: `--color-accent` is decorative only in light modes. Text on tinted surfaces uses `--color-text-primary`. Anything on a primary background uses `--color-on-primary`. Colour declarations live only in the palette blocks — never hardcode hex in components (the OG image and apple icon are the exception; they follow the cream palette).

Visitors pick a palette and Light/Dark/System from the "Appearance" section of the drawer (stored in `localStorage` as `ar_palette` / `ar_mode`). Admin sets the site default and can hide the picker (`siteSettings/general`).

### Typography
- Headings: Lora 500 (`h-display` 48–72px hero, `h-page` 36–48px, `h-section` 26–32px, `h-card` 18px), line-height 1.05–1.3, `-0.01em`
- Accent: `accent-italic` (Lora italic 400 in `--color-accent-text`) for the byline and one hero word
- Eyebrows: `eyebrow` (Inter 500, 12px, uppercase, 0.16em tracking, tertiary colour)
- Body: Inter 16px/1.6 UI, `text-body` 17px/1.65 for recipe text, `.prose` 17px/1.65 with 68ch measure

### Focus and forms
- Keyboard focus: global `:focus-visible` 2px primary outline, 2px offset
- Inputs: `.field` (hairline border; on focus the border turns primary with a 1px inset — no glow), `.field-bare` for inputs inside a `.field` wrapper (hero search, inline newsletter)
- Links: `.link` underline, offset 3px, brightens on hover

---

## Site Architecture

### Navigation
Hamburger menu on the **left at every breakpoint**, minimalist 56px sticky header (hamburger · centred wordmark · search + theme toggle). The drawer is an always-mounted portal (`data-state`, `inert` when closed) with accordion groups, an Appearance picker and a tagline/Instagram footer:

1. **Recipes** → Starters, Main Courses, Side Dishes, Desserts, Bread, Drinks, Baby Weaning
2. **Lifestyle** → Days Out, Eating Out, Travel, Parenting, Craft & Hobbies
3. **About Me** · 4. **Newsletter** · 5. **Contact**

Ctrl/Cmd+K opens the search overlay from anywhere.

### Public pages

**Home (`/`)**: Hero (byline, "Pure comfort, *cooked simply*", tagline, search, Browse recipes / About me) with the "New this week" featured recipe beside it → Currently cooking (3 latest) → Explore by category (two-column list with counts) → Most loved (4 rows) → Beyond the kitchen (3 posts) → Instagram band → Newsletter.

**Recipes (`/recipes`)**: compact "What to eat?" grid, search, **Meal Type** pills, native sort select, favourites. State lives in the URL (`?q=`, `?category=`, `?mealType=a,b`).

**Recipe (`/recipes/[slug]`)**: header with badges, placeholder hero (+ Instagram reel embed when set), italic personal story, stats strip, jump/print/share, ingredients with real checkboxes and servings scaling, numbered method, tips callout, nutrition accordion, related recipes. Schema.org Recipe JSON-LD.

**Lifestyle (`/lifestyle`, `/lifestyle/[slug]`)**: category pills with `?category=` deep links, prose article, share, more stories.

**About**, **Contact**, **Newsletter**, custom 404. `/shop` redirects to `/`.

### Admin (`/admin`, Google sign-in, `ADMIN_EMAIL` allow-list)
Dashboard · Recipes · Lifestyle · Comments · Subscribers (CSV export) · Messages · Settings (featured recipe, Instagram handle, default palette, show theme picker). Mutations revalidate the affected public pages.

---

## Data Models (Firestore)

```
recipes/{id}
  title, slug, description, personalStory, instagramUrl?
  category: RecipeCategory[]   // starters|mains|sides|snacks|desserts|bread|drinks|baby-weaning
  mealType: MealType[]         // breakfast|brunch|lunch|dinner
  tags[], dietaryTags[], specialOccasion[]
  prepTime, cookTime, servings, difficulty
  ingredients[{id, amount, unit, name, group?}], instructions[{step, text, image?}]
  heroImage, tips, nutrition?, seo?
  status: draft|published, featured, rating{average,count}, viewCount
  createdAt, updatedAt, publishedAt?, scheduledAt?

lifestylePosts/{id}
  title, slug, excerpt, content (HTML)
  category: LifestyleCategory  // days-out|eating-out|travel|parenting|craft-hobbies
  readingTime, status, createdAt, updatedAt, publishedAt

subscribers/{normalisedEmail}
  email, source: home|footer|newsletter-page, status: subscribed|unsubscribed, createdAt

siteSettings/general
  recipeOfTheWeekSlug, instagramHandle, defaultPalette, showThemePicker, updatedAt

comments/{id}, contactMessages/{id}   (unchanged)
```

Composite indexes are checked in at `firestore.indexes.json` and deployed; rules (`firestore.rules`) deny all client access because every read/write is server-side via the Admin SDK.

---

## SEO
- Metadata API on every page; `metadataBase` = `SITE_URL` (env-driven)
- `icon.svg`, `apple-icon.tsx`, `opengraph-image.tsx` (1200×630, Lora when fetchable)
- `robots.ts`, `sitemap.ts` from Firestore with sample fallback
- JSON-LD: WebSite (+SearchAction) and Organization in the layout, Recipe on recipe pages
- Public pages and the root layout `revalidate = 3600`; admin mutations call `revalidatePath`

---

## Key Technical Decisions

1. Server Components by default; client components only for interactivity (`useIsClient` for portals instead of mount effects)
2. All Firestore access via Admin SDK; client SDK is auth-only
3. URL is the source of truth for recipe/lifestyle filters (shareable, back-button friendly, Suspense-wrapped)
4. Brand strings live in `src/lib/site.ts`; taxonomy + nav tree in `src/lib/constants.ts`; palettes in `src/lib/theme.ts` + `globals.css`
5. Theme state is an external store read with `useSyncExternalStore`; the root layout injects the admin default and a no-FOUC script
6. Newsletter stored in Firestore (no third-party ESP); admin exports CSV
7. Images intentionally placeholder-only until Firebase Storage is enabled
8. Favourites in localStorage with a `favorites-changed` event for reactive filtering

---

## File Structure (key paths)
```
src/
├── app/
│   ├── layout.tsx (fonts, settings, ThemeProvider, no-FOUC script), page.tsx, not-found.tsx
│   ├── sitemap.ts, robots.ts, icon.svg, apple-icon.tsx, opengraph-image.tsx
│   ├── recipes/ (page.tsx, RecipesClient.tsx, [slug]/)
│   ├── lifestyle/ (page.tsx, LifestyleClient.tsx, [slug]/)
│   ├── about/, contact/ (page.tsx + ContactClient.tsx), newsletter/
│   ├── admin/ (layout, dashboard, recipes, lifestyle, comments, messages, subscribers, settings, login)
│   └── api/ (newsletter, contact, comments, revalidate, admin/*)
├── components/
│   ├── layout/ (Header, NavDrawer, SearchOverlay, Footer)
│   ├── home/ (HeroSection, HeroSearch, FeaturedRecipe, CurrentlyCooking, ExploreByCategory, MostLoved, LifestyleTeaser, InstagramBlock, NewsletterSection)
│   ├── recipe/ (WhatToEatGrid, RecipeCard, RecipeGrid, InstagramEmbed, IngredientList, InstructionStep, ShareButtons, ...)
│   ├── shared/ (ThemeProvider, ThemePicker, ThemeToggle, SectionHeader, NewsletterForm, FoodPlaceholder, FavoriteButton, BackToTop, InstagramIcon)
│   ├── admin/ (AdminBrand, RecipeForm, LifestyleForm)
│   └── ui/ (Button + ButtonLink, Card, Badge, Input, FilterPill, Select, Chevron, Modal, Skeleton, StarRating, Logo)
├── hooks/ (useDebounce, useIsClient, useAuth)
├── lib/ (site.ts, constants.ts, theme.ts, themeStore.ts, categoryCounts.ts, search.ts, favorites.ts, utils.ts, adminFetch.ts, firebase/*)
├── styles/globals.css
└── types/index.ts
scripts/check-contrast.mjs · firestore.rules · firestore.indexes.json · firebase.json · .firebaserc · README.md
```
