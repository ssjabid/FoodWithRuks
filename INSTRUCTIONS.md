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
| Fonts | Lora (headings) + Inter (body), `next/font/google` |
| Animation | Framer Motion |
| Database | Firebase Firestore (Admin SDK, server only) |
| Auth | Firebase Auth (Google sign-in) for the admin CMS |
| Hosting | Vercel (Git integration; `main` = production) |
| Embeds | react-social-media-embed (Instagram) |

---

## Design Philosophy — "Warm Ma (空間)"

Generous negative space (Ma), asymmetric balance, simplicity, natural shapes, understated elegance — now in a warmer, earthier palette with a serif voice.

**In practice**
- Extra-large padding, soft shadows, 16px card corners, 10px button corners, pill badges
- Lora gives the brand its handwritten-cookbook warmth; Inter keeps UI text crisp
- Animations are gentle (fade/slide 300–400ms, spring hovers); nothing that draws attention to itself
- Mobile first: the hamburger drawer is the primary navigation on every screen size

### Colour System — "Warm Sage & Clay"

Swatches: clay `#C7A491` · blush `#EECFCA` · sage `#919682` · light sage `#C7CDBF` · olive `#595E48`

```
Light                                  Dark
--color-primary:      #595E48          #C7CDBF
--color-primary-hover:#474B39          #D9DDD1
--color-on-primary:   #FFFFFF          #1B1D17
--color-secondary:    #E4E8DD          #333828
--color-accent:       #C7A491          #C7A491   (decorative; text-safe only in dark)
--color-accent-soft:  #EECFCA          #3A2E2A
--color-accent-text:  #8F624B          #D9B9A5   (clay for text, AA)
--color-sage:         #919682          #919682   (icons/borders/large text only)
--color-background:   #FCFBF8          #1B1D17
--color-surface:      #F5F3EE          #22251D
--color-elevated:     #FFFFFF          #2B2F25
--color-text-primary: #2A2D22          #F1EEE7
--color-text-secondary:#595E48         #B9BDAF
--color-text-tertiary:#6E7362          #868B7B
--color-border:       #DDE1D6          #3A3F32
--color-success/warning/error: #6C7E5B / #B98230 / #B5564A   (dark: #A7B894 / #D9B27A / #E39383)
```

Rules: colours are declared once in `:root` and `.dark` (never duplicated in `@theme`). Anything on a primary background uses `--color-on-primary`. `#919682` is 3.05:1 on white — never body text.

### Typography
- Headings: Lora, weight 600 (Lora has no 800), `letter-spacing: -0.01em`
- Body: Inter 400–500
- Byline / pull quotes: Lora italic in `--color-accent-text`
- Utilities: `font-heading`, `font-body`

---

## Site Architecture

### Navigation
Hamburger menu on the **left at every breakpoint**, minimalist header (hamburger · centred wordmark · search + theme toggle). Drawer slides from the left with accordion groups:

1. **Recipes** → Starters, Main Courses, Side Dishes, Desserts, Bread, Drinks, Baby Weaning
2. **Lifestyle** → Days Out, Eating Out, Travel, Parenting, Craft & Hobbies
3. **About Me**
4. **Newsletter**
5. **Contact**

Ctrl/Cmd+K opens the search overlay from anywhere.

### Public pages

**Home (`/`)**: Hero (byline, wordmark, tagline, search bar, CTAs) → New Recipe of the Week → What to eat? grid → Fresh from the kitchen (3 latest) → Beyond the kitchen (3 lifestyle posts) → Follow on Instagram → Newsletter.

**Recipes (`/recipes`)**: "What to eat?" boxes (Starters, Main Course, Side Dishes, Snacks, Breakfast, Dinner, Desserts, Drinks, Bread, Baby Weaning), search, **Meal Type** filter pills (Breakfast, Brunch, Lunch, Dinner), sort, favourites. State lives in the URL (`?q=`, `?category=`, `?mealType=a,b`).

**Recipe (`/recipes/[slug]`)**: hero placeholder (+ Instagram reel embed when a URL is set), header with category/diet badges, personal story, stats bar, servings adjuster, jump-to, print/share, ingredients, instructions, tips, nutrition, related. Schema.org Recipe JSON-LD.

**Lifestyle (`/lifestyle`, `/lifestyle/[slug]`)**: category pills with `?category=` deep links, article prose, share, related.

**About (`/about`)**, **Contact (`/contact`)**, **Newsletter (`/newsletter`)**, custom 404. `/shop` redirects to `/`.

### Admin (`/admin`, Google sign-in, `ADMIN_EMAIL` allow-list)
Dashboard · Recipes · Lifestyle · Comments · Subscribers (CSV export) · Messages · Settings (pin Recipe of the Week, Instagram handle). Mutations revalidate the affected public pages.

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
  recipeOfTheWeekSlug, instagramHandle, updatedAt

comments/{id}, contactMessages/{id}   (unchanged)
```

Composite indexes are checked in at `firestore.indexes.json`; rules (`firestore.rules`) deny all client access because every read/write is server-side via the Admin SDK.

---

## SEO
- Metadata API on every page; `metadataBase` = `SITE_URL` (env-driven)
- `icon.svg`, `apple-icon.tsx`, `opengraph-image.tsx` (1200×630, Lora when fetchable)
- `robots.ts`, `sitemap.ts` from Firestore with sample fallback
- JSON-LD: WebSite (+SearchAction) and Organization in the layout, Recipe on recipe pages
- Public pages `revalidate = 3600`; admin mutations call `revalidatePath`

---

## Key Technical Decisions

1. Server Components by default; client components only for interactivity
2. All Firestore access via Admin SDK; client SDK is auth-only
3. URL is the source of truth for recipe/lifestyle filters (shareable, back-button friendly, Suspense-wrapped)
4. Brand strings live in `src/lib/site.ts`; taxonomy + nav tree in `src/lib/constants.ts`; nothing brand-related is hardcoded in components
5. Newsletter stored in Firestore (no third-party ESP); admin exports CSV
6. Images intentionally placeholder-only until Firebase Storage is enabled
7. Favourites in localStorage with a `favorites-changed` event for reactive filtering

---

## File Structure (key paths)
```
src/
├── app/
│   ├── layout.tsx, page.tsx, not-found.tsx, sitemap.ts, robots.ts, icon.svg, apple-icon.tsx, opengraph-image.tsx
│   ├── recipes/ (page.tsx, RecipesClient.tsx, [slug]/)
│   ├── lifestyle/ (page.tsx, LifestyleClient.tsx, [slug]/)
│   ├── about/, contact/ (page.tsx + ContactClient.tsx), newsletter/
│   ├── admin/ (layout, dashboard, recipes, lifestyle, comments, messages, subscribers, settings, login)
│   └── api/ (newsletter, contact, comments, revalidate, admin/*)
├── components/
│   ├── layout/ (Header, NavDrawer, SearchOverlay, Footer)
│   ├── home/ (HeroSection, RecipeOfTheWeek, WhatToEatSection, LatestRecipes, LifestyleTeaser, InstagramBlock, NewsletterSection)
│   ├── recipe/ (WhatToEatGrid, RecipeCard, RecipeGrid, InstagramEmbed, IngredientList, ...)
│   ├── shared/ (NewsletterForm, InstagramIcon, ThemeToggle, FoodPlaceholder, FavoriteButton, ...)
│   ├── admin/ (AdminBrand, RecipeForm, LifestyleForm)
│   └── ui/ (Logo, Button, Card, Badge, Input, FilterPill, AnimatedDropdown, Modal, Skeleton, StarRating)
├── lib/ (site.ts, constants.ts, search.ts, favorites.ts, utils.ts, adminFetch.ts, firebase/*)
├── styles/globals.css
└── types/index.ts
firestore.rules · firestore.indexes.json · firebase.json · .firebaserc · README.md
```
