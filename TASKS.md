# TASKS.md — Agooh & Ruks Task Tracker

> Claude Code: Pick the next unchecked task in order. After completing, mark it `[x]` and update CLAUDE.md.

---

## Phase 1 — Foundation

### 1.1 Project Setup
- [x] Initialize Next.js 14+ project with TypeScript and App Router
- [x] Install and configure Tailwind CSS
- [x] Install dependencies: react-social-media-embed, firebase, firebase-admin
- [x] Set up project folder structure per INSTRUCTIONS.md
- [x] Create `.env.example` with all required environment variable keys
- [ ] Initialize Git repo, create GitHub repository, push initial commit
- [ ] Connect GitHub repo to Vercel for auto-deployment — **DEFERRED**
- [ ] Verify deployment works (blank Next.js app live on Vercel) — **DEFERRED**

### 1.2 Firebase Setup
- [x] Create Firebase project in Firebase Console
- [x] Enable Firestore *(Auth + Storage deferred)*
- [x] Generate Firebase client config and add to `.env.local`
- [x] Generate Firebase Admin service account key
- [x] Create `src/lib/firebase/config.ts` (client SDK init)
- [x] Create `src/lib/firebase/admin.ts` (Admin SDK init)
- [ ] Set up Firestore security rules (public read published, admin write, anonymous comment create)
- [ ] ~~Set up Storage security rules~~ — **DEFERRED (Storage not enabled)**
- [ ] Test Firebase connection

### 1.3 Design System
- [x] Define full CSS custom properties in `globals.css` (light + dark palettes, spacing scale)
- [x] Configure Tailwind CSS v4 with `@theme` directive (CSS variables)
- [x] Implement dark mode toggle (system preference detection + manual toggle with localStorage persistence)
- [x] Set up font: Inter (all text — headings weight 700-800, body weight 400-500) via next/font
- [x] Create TypeScript interfaces in `src/types/index.ts` (Recipe, Category, Comment, ContactMessage, SiteSettings)
- [x] Create utility functions in `src/lib/utils.ts` (slugify, formatDate, formatCookTime, cn helper)
- [x] Create constants in `src/lib/constants.ts` (nav items, dietary tags list, difficulty options)

### 1.4 Base UI Components
- [x] Button component (primary, secondary, outline, ghost variants; sizes sm/md/lg)
- [x] Card component (with hover effect — subtle scale + shadow increase)
- [x] Input component (text, textarea, with label and error state)
- [x] Badge component (for category tags, dietary tags — pill shape)
- [x] Skeleton loader component (for recipe cards, text blocks)
- [x] StarRating component (display + interactive input modes)
- [x] Modal component (for confirmations, previews)
- [x] ThemeToggle component (sun/moon icon, smooth transition)
- [x] Logo component (script font "FoodWithRuks")

### 1.5 Layout
- [x] Create root layout (`src/app/layout.tsx`) with fonts, theme provider, metadata
- [x] Build Header component (logo, nav links, theme toggle, mobile hamburger)
- [x] Build Footer component (nav, social icons, copyright, newsletter CTA)
- [x] Build MobileMenu component (slide-out overlay with nav links)
- [ ] Test responsive layout at 375px, 768px, 1024px, 1440px
- [ ] Verify dark mode across all layout components

### 1.6 Landing Page
- [x] Build Hero section (gradient background, split logo text)
- [x] Build Featured Recipes section (asymmetric grid, placeholder cards)
- [x] Build About Snippet section (text-only, no photo)
- [x] Build Categories section (pill links from RECIPE_CATEGORIES)
- [x] Build Instagram Feed section (placeholder grid + CTA) — **Replaced with LifestyleTeaser + ShopTeaser**
- [x] Build Newsletter Signup section (email input + submit)
- [x] Assemble full landing page with Ma spacing between sections
- [x] Add scroll-based fade-in animations (IntersectionObserver)
- [ ] Test landing page responsiveness + dark mode

---

## Phase 2 — Recipe Display

### 2.1 Recipe Components
- [x] RecipeCard component (image, title, category badge, cook time, rating, favorite heart)
- [x] RecipeCard hover state (gentle scale + shadow)
- [x] RecipeCardSkeleton for loading states
- [x] RecipeGrid component (responsive grid with generous Ma gaps)
- [x] FavoriteButton component (heart icon, localStorage toggle)
- [x] Create `src/lib/favorites.ts` (saveFavorite, removeFavorite, isFavorited, getFavorites)

### 2.2 Recipes Listing Page (`/recipes`)
- [x] Create `src/lib/firebase/recipes.ts`: getPublishedRecipes() with pagination
- [x] Build search bar with debounce (useDebounce hook)
- [x] Build filter bar (4-group system: Category, Meal Type, Special Diet, Special Occasion — pill-based UI)
- [x] Build sort options (Newest, Most Popular, Quickest)
- [x] Build recipe grid (using sample data — Firebase integration ready)
- [x] Build favorites filter toggle ("Show saved recipes")
- [x] Add loading states (skeleton grid)
- [x] Add empty state ("No recipes found" with illustration)
- [x] Test with sample/seed data

### 2.3 Single Recipe Page (`/recipes/[slug]`)
- [x] Create `src/lib/firebase/recipes.ts`: getRecipeBySlug(), getRelatedRecipes()
- [x] Build hero image section (fallback placeholder when no image)
- [x] Build recipe header (title in Inter bold, category badges, date)
- [x] Build personal story section (distinct styling — accent background, decorative quotes)
- [x] Build quick stats bar (prep, cook, total time, servings, difficulty)
- [x] Build ServingsAdjuster component (increase/decrease buttons, recalculates ingredients)
- [x] Build IngredientList component (checkable checkboxes, grouped by section, adjustable quantities)
- [x] Build InstructionStep component (numbered cards, optional photo per step)
- [x] Build Tips & Notes callout box (accent background)
- [x] Build Nutrition section (collapsible/expandable)
- [x] Build JumpToRecipe button (sticky on mobile, scrolls to ingredients)
- [x] Build ShareButtons component (copy link, WhatsApp, Pinterest, Twitter/X)
- [x] Build PrintButton component
- [x] Build related recipes section (3 cards grid)
- [x] Add print stylesheet (in globals.css)
- [x] Add Schema.org Recipe JSON-LD structured data
- [ ] Test full page at all breakpoints + dark mode

### 2.4 Category Pages
- [x] Create `src/lib/firebase/categories.ts`: getCategories(), getCategoryBySlug()
- [x] Build categories listing page — **REMOVED: categories are now filters within /recipes**
  - Categories page removed. Categories integrated as filter group in recipes listing.
- [x] Wire category filtering on `/recipes?category=[slug]`

### 2.5 SEO
- [x] Set up Next.js Metadata API on all pages (title, description, OG, Twitter)
- [x] Create dynamic sitemap (`src/app/sitemap.ts`) from published recipes
- [x] Create `robots.txt`
- [x] Set up canonical URLs on all pages (via metadataBase)
- [ ] Create dynamic OG image generation (`/api/og/route.tsx` using @vercel/og)
- [ ] Verify Schema.org with Google Rich Results Test

---

## Phase 2.5 — New Pages & Restructure

### 2.6 Lifestyle Page
- [x] Create LifestylePost type in types/index.ts
- [x] Create sample lifestyle posts data (4 articles)
- [x] Build lifestyle listing page (/lifestyle) with category filter pills + 2-column grid
- [x] Build lifestyle article pages (/lifestyle/[slug]) with prose content, share buttons, related posts
- [x] Build LifestyleTeaser homepage section ("From the Kitchen Journal")
- [x] Build lifestyle admin editor (/admin/lifestyle) — create/edit/delete posts

### 2.7 Shop Page — REMOVED (2026-09-07)
- [x] ~~Shop page, ShopTeaser, product admin, product API, Product type, sample products~~ — **REMOVED in the Agooh & Ruks revamp. /shop now redirects to /.**

### 2.8 Site-wide Polish
- [x] Remove all Unsplash images — replace with FoodPlaceholder component (SVG icons)
- [x] Update navigation: Recipes, About, Lifestyle, Shop, Contact (removed Home + Categories)
- [x] Add micro-interactions: btn-press, card-hover, link-arrow, filter-pill, social-hover, coming-soon-pulse
- [x] Add BackToTop button component
- [x] Add scroll-based header transition (transparent → blurred/shadowed)
- [x] Restructure landing page (7 sections: Hero, Featured, Categories, About, Lifestyle, Shop, Newsletter)
- [x] Update Footer to 4-column layout (Brand, Navigation, Recipes, Connect — with inline newsletter)
- [x] Update sitemap.ts for new pages (lifestyle, shop, article slugs)
- [x] Update revalidation API route for new pages
- [x] Delete /categories page (categories integrated as recipe filters)
- [x] Remove InstagramSection component

### 2.9 UI Refinement Pass
- [x] Standardize interactive element sizing: filter pills h-9, CTA buttons h-11, inputs h-11, small action buttons w-10 h-10
- [x] Redesign recipe filter section: collapsible panel with badge count, sort + favorites inline
- [x] Tighten all page layouts: max-w-6xl mx-auto, py-16 sm:py-20, consistent page header pattern
- [x] Unify card design: aspect-[4/3] placeholders, p-4 content, text-base font-bold titles
- [x] Restructure footer: 4-column (Brand, Navigation, Recipes, Connect) with social icons + inline newsletter
- [x] Homepage tightening: centered hero, 3-card featured grid, trimmed about snippet
- [x] Dark mode polish: verified CSS variable system, cards use --color-elevated, fixed header-scrolled CSS

### 2.10 UI Consistency Pass (DRY)
- [x] Create reusable FilterPill component (`src/components/ui/FilterPill.tsx`) — single source for all filter pills
- [x] Create AnimatedDropdown component (`src/components/ui/AnimatedDropdown.tsx`) — replaces native `<select>` with animated dropdown
- [x] Replace duplicate inline FilterPill in LifestyleClient.tsx with shared component
- [x] Replace duplicate inline FilterPill in ShopClient.tsx with shared component
- [x] Replace inline filter pills in RecipesClient.tsx FilterGroup with shared FilterPill
- [x] Replace Favorites button on /recipes with FilterPill
- [x] Replace native `<select>` sort dropdown on /recipes with AnimatedDropdown
- [x] Standardize all h2 section headings: `text-2xl sm:text-3xl font-bold tracking-tight` (FeaturedRecipes, CategoriesSection, LifestyleTeaser, ShopTeaser, AboutSnippet, LifestylePostClient)
- [x] DRY audit: confirmed cards (p-4), badges, text colors, spacing, grid gaps already consistent
- [x] Build passes with no errors

---

## Phase 3 — Admin CMS

### 3.1 Authentication
- [x] Create admin login page (`/admin/login`) — Google Sign-In (not email/password)
- [x] Implement Firebase Auth sign-in/sign-out (Google provider)
- [x] Create `src/hooks/useAuth.ts` for admin session management (Google sign-in + server-side admin verification)
- [x] Build admin layout (`/admin/layout.tsx`) with auth guard (redirect if not authed)
- [x] Build admin sidebar navigation (desktop fixed + mobile hamburger drawer)
- [x] Create `src/lib/firebase/authCheck.ts` — server-side verifyAdminRequest (Bearer token + ADMIN_EMAIL check)
- [x] Create `src/lib/adminFetch.ts` — authenticated fetch helper
- [x] Create `/api/admin/verify` endpoint

### 3.2 Admin Dashboard
- [x] Build dashboard stats cards (total recipes, total posts, pending comments, unread messages)
- [x] Build quick action buttons (New Recipe, New Post, New Product)
- [x] Build recent recipes list with status badges
- [x] Create `/api/admin/stats` endpoint

### 3.3 Recipe Editor
- [x] Build recipe form layout (organized sections with clear labels) — `src/components/admin/RecipeForm.tsx`
- [x] Title input with auto-slug generation
- [x] Description + Personal Story text areas
- [x] Instagram URL input
- [x] Category multi-select (pill-based)
- [x] Tags free-form input
- [x] Dietary tags multi-select (pill-based)
- [x] Meal type + special occasion multi-select
- [x] Time inputs (prep, cook) + servings + difficulty dropdown
- [x] Dynamic ingredients list (add/remove rows — Amount, Unit, Name, Group)
- [x] Dynamic instructions list (add/remove numbered rows — text + image URL)
- [ ] ~~Hero image upload (drag-and-drop, Firebase Storage)~~ — **DEFERRED: Storage not enabled. Using URL text field instead.**
- [ ] ~~Create `src/lib/firebase/storage.ts`~~ — **DEFERRED: Storage not enabled.**
- [x] Nutrition fields (optional, collapsible section)
- [x] SEO fields (meta title, description with char counter)
- [x] Draft / Published toggle + Featured toggle
- [x] Create `src/lib/firebase/recipes.ts`: createRecipe(), updateRecipe(), deleteRecipe()
- [ ] Implement auto-save for drafts (every 30 seconds) — **DEFERRED: nice-to-have**
- [ ] Build preview mode (opens recipe as public page) — **DEFERRED: nice-to-have**
- [x] Build validation (required fields: title, 1+ category, 1+ ingredient, 1+ instruction)

### 3.4 Recipe List (`/admin/recipes`)
- [x] Build table view (Title, Status badge, Category, Date, Edit/Delete)
- [x] Filter by status (All / Published / Draft)
- [x] Search by title
- [x] Delete with confirmation modal

### 3.5 Category Manager (`/admin/categories`)
- [ ] ~~Build category list with order display~~ — **DEFERRED: Categories managed inline via recipe editor pill selects**
- [ ] ~~Build category form~~ — **DEFERRED**
- [ ] ~~CRUD operations~~ — **DEFERRED**
- [ ] ~~Reorder capability~~ — **DEFERRED**

### 3.6 On-demand Revalidation
- [x] Create `/api/revalidate/route.ts` — triggers ISR rebuild for recipe/category pages
- [ ] Call revalidation after recipe publish/update/delete — **TODO: wire into admin save actions**

### 3.7 Lifestyle Admin
- [x] Build lifestyle form (`src/components/admin/LifestyleForm.tsx`) — title, slug, excerpt, category, HTML content, reading time, status
- [x] Build lifestyle list page (`/admin/lifestyle`) with filter + delete
- [x] Build new/edit lifestyle pages
- [x] Create `src/lib/firebase/lifestyle.ts` — full CRUD
- [x] Create admin API routes (`/api/admin/lifestyle`, `/api/admin/lifestyle/[id]`)

### 3.8 Shop Admin
- [x] Build product form (`src/components/admin/ProductForm.tsx`) — name, slug, description, price, category, image URL, inStock/comingSoon
- [x] Build shop list page (`/admin/shop`) with status badges + delete
- [x] Build new/edit product pages
- [x] Create `src/lib/firebase/products.ts` — full CRUD
- [x] Create admin API routes (`/api/admin/shop`, `/api/admin/shop/[id]`)

### 3.9 Comment Moderation
- [x] Build comments page (`/admin/comments`) with filter (Pending/Approved/All)
- [x] Approve + delete buttons per comment
- [x] Create `src/lib/firebase/comments.ts` — getAllComments, updateCommentStatus, deleteComment
- [x] Create admin API routes (`/api/admin/comments`, `/api/admin/comments/[id]`)

### 3.10 Contact Messages
- [x] Build messages page (`/admin/messages`) with expandable cards, read/unread indicator
- [x] Mark read/unread + delete
- [x] Create `src/lib/firebase/messages.ts` — getAllMessages, markMessageRead, deleteMessage
- [x] Create admin API routes (`/api/admin/messages`, `/api/admin/messages/[id]`)

### 3.11 Firestore Integration
- [x] Uncomment Firestore saves in `/api/contact/route.ts`
- [x] Uncomment Firestore saves in `/api/comments/route.ts`
- [x] Public recipes page reads from Firestore with sample data fallback
- [x] Single recipe page reads from Firestore with sample data fallback
- [x] Homepage featured recipes reads from Firestore with sample data fallback
- [x] Lifestyle pages read from Firestore with sample data fallback
- [x] Shop page reads from Firestore with sample data fallback

---

## Phase 4 — Engagement & Polish

### 4.1 Anonymous Comments & Ratings
- [ ] Build AnonymousCommentForm (star rating + text input, no name/email)
- [ ] Create `src/lib/spam.ts` (honeypot validation, time check, rate limiting)
- [x] Create `/api/comments/route.ts` (POST with validation — Firestore save commented out until connected)
- [ ] Build comments display (approved only, with ratings)
- [x] Calculate + display average rating on recipe page and cards
- [x] Build comment moderation in admin (`/admin/comments`) — approve/delete

### 4.2 Contact Page
- [x] Build Contact Us page (`/contact`) with form + honeypot
- [x] Create `/api/contact/route.ts` (POST with validation — Firestore save commented out until connected)
- [x] Build success/error states
- [x] Build messages list in admin (`/admin/messages`) — view, mark read, delete

### 4.3 Content Pages
- [x] Build About page (personal story, photo placeholder, social links, link to contact) — (updated: text-only, no photo)
- [x] ~~Build Instagram feed section on homepage~~ — **REMOVED: replaced with LifestyleTeaser + ShopTeaser sections**
- [x] Build Newsletter signup component (email capture — Firestore save TODO)

### 4.4 Recipe Page Extras
- [x] Build share buttons functionality (copy link, WhatsApp deep link, Pinterest pin URL, X/Twitter)
- [x] Build related recipes section (3 cards grid)
- [ ] Wire up view count increment on page visit

### 4.5 Polish
- [x] Audit all pages for dark mode consistency *(UI Refinement pass — CSS variable system verified, cards use --color-elevated, placeholder uses --color-surface in dark)*
- [x] Audit all pages for Ma spacing (generous, intentional) *(UI Refinement pass — all pages py-16 sm:py-20, max-w-6xl, gap-5 sm:gap-6)*
- [ ] Audit all pages for mobile responsiveness (375px, 768px, 1024px, 1440px)
- [x] Add scroll fade-in animations on all list/grid sections (useInView hook + ScrollReveal component)
- [x] Add smooth page transitions *(Animation overhaul — framer-motion PageTransition on all pages, fade+slide)*
- [x] Build custom 404 page (warm, on-brand, with link back to recipes)
- [ ] Add error boundaries
- [ ] Performance optimization (bundle size, image sizes, lazy loading)
- [ ] Run Lighthouse audit, fix anything below 90

### 4.6 Animation Overhaul (framer-motion)
- [x] Install framer-motion, create PageTransition + StaggerReveal shared components
- [x] iOS-style sliding nav pill with layoutId + glassmorphism header on scroll
- [x] Mobile menu right drawer with AnimatePresence + staggered items
- [x] Card hover lift (-8px) + inner zoom (scale 1.06) on placeholders
- [x] Button fill-from-left hover effect + whileHover lift + whileTap press
- [x] Staggered scroll cascade on all grids (StaggerContainer/StaggerItem, spring physics)
- [x] Bouncy filter pills on recipes, lifestyle, shop pages (scale 1→1.08→1)
- [x] Heart bounce + glow ring on favorite toggle
- [x] Inline newsletter submit (rounded-full container, AnimatePresence success state)
- [x] Sun/moon morph dark mode toggle (AnimatePresence mode="wait" with rotation)
- [x] Scroll progress bar on recipe detail pages (useScroll + useSpring)
- [x] Share buttons with whileHover/whileTap + "Copied" morph (AnimatePresence)
- [x] Animated ingredient checkboxes (bounce fill + line-through + opacity fade)
- [x] Star rating cascade animation (60ms delay per star, spring physics)
- [x] Nutrition section AnimatePresence expand/collapse + animated chevron
- [x] PageTransition on all pages: home, recipes, recipe detail, lifestyle, lifestyle articles, shop, about, contact, 404

---

## Phase 5 — Launch Prep

### 5.1 Domain & Deployment
- [ ] Purchase/configure custom domain (foodwithruks.com)
- [ ] Set up DNS in Vercel (A record + CNAME for www)
- [ ] Verify SSL certificate
- [ ] Test root domain + www redirect

### 5.2 Content Seeding
- [ ] Create seed script (`scripts/seed.ts`)
- [ ] Seed 5-10 real recipes with actual photos
- [ ] Create all recipe categories with images
- [ ] Configure siteSettings (social links, tagline, hero, Instagram URLs)

### 5.3 Analytics
- [ ] Enable Vercel Analytics or Google Analytics
- [ ] Set up Vercel Speed Insights
- [ ] Verify Core Web Vitals passing

### 5.4 Final QA
- [ ] Test on real devices (iPhone, Android, iPad, desktop)
- [ ] Test full recipe flow: create → publish → view → share → comment → approve
- [ ] Test contact form submission → admin review
- [ ] Test favorites (save, filter, persist across refresh)
- [ ] Cross-browser test (Chrome, Safari, Firefox, Edge)
- [ ] Final Lighthouse audit (target 95+)
- [ ] Test rich snippets with Google Rich Results Test
- [ ] Test OG images render on Twitter, Facebook, WhatsApp
- [ ] Test print mode on recipe pages

---

## Phase 6 — Agooh & Ruks Revamp (2026-09-07)

### 6.1 Brand + Config
- [x] Rename to "Agooh & Ruks" (byline "Pass the Butter, Ruks", taglines) — `src/lib/site.ts` single source
- [x] Env-driven `SITE_URL` (NEXT_PUBLIC_SITE_URL → Vercel production URL → foodwithruks.vercel.app); share links use window origin
- [x] Instagram-only social links (@foodwithruks); remove fake Pinterest/TikTok/YouTube
- [x] localStorage keys renamed (`ar_theme`, `ar_favorites`)

### 6.2 Taxonomy
- [x] Recipe categories: starters, mains, sides, snacks, desserts, bread, drinks, baby-weaning (typed unions)
- [x] Lifestyle categories: days-out, eating-out, travel, parenting, craft-hobbies (slugs + labels)
- [x] `WHAT_TO_EAT` boxes and `NAV_TREE` with nested topics
- [x] Sample data retagged (+ raita, lentil mash, masala omelette, farm-park post)

### 6.3 Design tokens + fonts
- [x] "Warm Sage & Clay" palette (light + dark), contrast-checked
- [x] Colours declared once in :root/.dark; `--color-on-primary`, `--color-accent-text`, `--color-accent-soft`
- [x] Lora (headings) + Inter (body) via next/font on <html>; font-extrabold removed

### 6.4 Navigation
- [x] Header: hamburger left at all sizes, centred Lora wordmark, search + theme toggle right
- [x] NavDrawer from the left with accordion groups, focus trap, Escape, return focus
- [x] SearchOverlay (Ctrl/Cmd+K) → /recipes?q=

### 6.5 Pages
- [x] Home: hero with search, Recipe of the Week, What to eat grid, latest recipes, lifestyle teaser (Firestore), Instagram block, newsletter
- [x] Recipes: What to eat grid + search + Meal Type filter only; URL-synced (q/category/mealType); favourites reactive; Suspense
- [x] Recipe detail: Instagram embed when URL set; JSON-LD publisher/url; static params from Firestore
- [x] Lifestyle: ?category= deep links, new taxonomy
- [x] About + Contact rebranded; Contact has server metadata
- [x] Shop removed; /shop → / redirect

### 6.6 Newsletter (real)
- [x] POST /api/newsletter (honeypot, validation, rate-limit-lite, dedupe by email doc id)
- [x] Shared NewsletterForm (inline/compact/stacked) replaces both fake forms
- [x] /newsletter page
- [x] Admin subscribers page (search, delete, CSV export), stats card, sidebar entry

### 6.7 Admin
- [x] AdminBrand component; dashboard greeting
- [x] /admin/settings (pin Recipe of the Week, Instagram handle) + API
- [x] revalidatePath after recipe/lifestyle create/update/delete

### 6.8 SEO + Firebase
- [x] icon.svg, apple-icon, opengraph-image (Lora fetched with fallback), robots.ts, sitemap.ts from Firestore
- [x] WebSite + Organization JSON-LD; page revalidate = 3600
- [x] firestore.rules (deny client), firestore.indexes.json, firebase.json, .firebaserc
- [ ] Deploy Firestore rules + indexes to production (`npx firebase-tools deploy --only firestore`)

### 6.9 Ship
- [x] Local build + type-check green
- [ ] Vercel preview verified, merged to main, production smoke test

---

## Backlog / Future Ideas

- [ ] Scheduled publishing (scheduledAt field ready — needs UI + cron/Cloud Function)
- [ ] Cooking mode (step-by-step fullscreen, keep screen awake, timers per step)
- [ ] Recipe video uploads (direct to Storage, not just Instagram embeds)
- [ ] Recipe collections / meal plans
- [ ] User accounts (cross-device favorites, profile, saved shopping lists)
- [ ] Shopping list generator from ingredients
- [ ] Multi-language support
- [ ] Progressive Web App (PWA)
- [ ] RSS feed for recipes
- [ ] Email notifications for new recipes (Resend integration)
- [ ] AI-powered recipe suggestions / search
- [ ] Recipe cost calculator
- [ ] Affiliate / sponsored recipe integration
- [ ] Real images: When Firebase Storage is enabled, replace FoodPlaceholder with actual recipe/lifestyle photos
- [x] Lifestyle admin editor for creating/editing blog posts
- [x] Instagram embed on recipe pages (InstagramEmbed component)
