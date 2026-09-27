# Agooh & Ruks

> Recipes from Ruks's kitchen: bakes first, some cooking, and the odd story. Pass the Butter, Ruks.

Ruks's recipe site, designed as a care package: the home page hands you a bake, the recipe is the note inside, and every tool (the scaler, the oven line, cook mode, the print card) looks after the reader. Built with Next.js, Tailwind CSS v4 and Firebase; CSS-only motion within a fixed ceiling. Deployed on Vercel.

**Live site:** https://foodwithruks.vercel.app (auto-deploys from `main`)

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, React 19, TypeScript strict) |
| Styling | Tailwind CSS v4 (CSS-first `@theme`), one palette with light and dark tokens in `src/styles/globals.css` |
| Fonts | Lora (display), Inter (text), Kalam (handwriting) via `next/font/google` |
| Motion | CSS only on the public site: the squish on save, one soft page fade, state changes under 220ms |
| Photos | Uploaded from the admin, resized in the browser, committed to this repo under `public/images/uploads` (needs `GITHUB_UPLOAD_TOKEN`) |
| Data | Firebase Firestore via the Admin SDK (server only) |
| Auth | Firebase Auth, Google sign-in, admin allow-list by email |
| Hosting | Vercel (Git integration) |

## Local development

```bash
npm install
cp .env.example .env.local   # fill in the values below
npm run dev                  # http://localhost:3000
```

Other scripts: `npm run build`, `npm run start`, `npm run lint`, `npm run typecheck`, `npm test` (unit tests for the recipe helpers), `npm run tells` (guards public copy against template tells and banned words), `node scripts/check-contrast.mjs` (every colour pair in both modes), `npm run gen:mark` (regenerates the favicon files from the mark), `npm run e2e` (end-to-end admin test against a running dev server), `npm run snap <label>` (gate screenshots and an axe run into `.snapshots/`; run `npx playwright install chromium` once first).

With an empty database the site shows example content so the layout can be judged: six example bakes in development and preview deployments, exactly one clearly labelled example in production. They disappear as soon as a real recipe is published.

## Environment variables

| Variable | Where | Purpose |
|---|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | client | Firebase web app config |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | client | Firebase web app config |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | client | Firebase web app config |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | client | Firebase web app config |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | client | Firebase web app config |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | client | Firebase web app config |
| `FIREBASE_PROJECT_ID` | server | Admin SDK |
| `FIREBASE_CLIENT_EMAIL` | server | Admin SDK service account |
| `FIREBASE_PRIVATE_KEY` | server | Admin SDK private key. Paste the full key in quotes with literal `\n` line breaks; the code converts them. |
| `ADMIN_EMAIL` | server | Comma-separated Google account emails allowed into `/admin` |
| `REVALIDATION_SECRET` | server | Shared secret for `/api/revalidate` and the signed draft previews |
| `GITHUB_UPLOAD_TOKEN`, `GITHUB_REPO`, `GITHUB_BRANCH` | server | Photo uploads commit to the repo (fine-grained token, Contents read and write on this repo only) |
| `NEXT_PUBLIC_SITE_URL` | build | Optional canonical origin. Leave unset on Vercel (the production URL is used automatically); set it when a custom domain exists. |

## Firebase setup

1. **Firestore** is enabled. Deploy the rules and composite indexes from this repo (requires `firebase login`):
   ```bash
   npx firebase-tools deploy --only firestore
   ```
   Without the indexes, published-recipe queries fail and the site silently falls back to example content (errors are logged server-side with an index-creation link).
2. **Authentication**: enable the Google provider, then add every domain the admin will sign in from (for example `foodwithruks.vercel.app`) under Authentication → Settings → Authorized domains.
3. **Storage** is not enabled (Blaze plan required). Photos are committed to the repo instead.

Collections: `recipes`, `lifestylePosts`, `comments`, `contactMessages`, `subscribers`, `siteSettings/general`, `siteSettings/pages`.

## Deploying (Vercel)

The Vercel project is connected to this GitHub repository. Every push to `main` is a production deploy; every other branch gets a preview URL (see the deployment status on the commit in GitHub). Work on a branch, check the preview, then merge.

Environment variables live in the Vercel project settings (Production + Preview). After the first deploy on a new domain, add that domain to Firebase Auth authorized domains or admin login fails with `auth/unauthorized-domain`.

## Admin

`/admin/login` uses Google sign-in. Access is granted only to emails listed in `ADMIN_EMAIL`. The admin manages recipes (with the yield, oven, extra-time and "personal bits" fields), stories, the Currently card and page copy, comments, contact messages, newsletter subscribers (with CSV export) and site settings (the front-page bake, her handwritten line, the lead collection and the hidden bakery page).

## Project docs

- `CLAUDE.md` — current project state and conventions (read first)
- `INSTRUCTIONS.md` — design system, architecture and data models
- `TASKS.md` — task tracker
