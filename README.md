# Agooh & Ruks

> Pure comfort, cooked simply. Warmth in every bite.

The recipe and lifestyle blog for Ruks, an Instagram food creator: wholesome, easy-to-follow recipes, plus days out, eating out, travel, parenting and crafts. Built with Next.js, Tailwind CSS v4 and Firebase; calm, CSS-only motion. Deployed on Vercel.

**Live site:** https://foodwithruks.vercel.app (auto-deploys from `main`)

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, React 19, TypeScript strict) |
| Styling | Tailwind CSS v4 (CSS-first `@theme`), design tokens in `src/styles/globals.css` |
| Fonts | Lora (headings) + Inter (body) via `next/font/google` |
| Motion | CSS transitions only (public site); five switchable palettes with light/dark |
| Data | Firebase Firestore via the Admin SDK (server only) |
| Auth | Firebase Auth, Google sign-in, admin allow-list by email |
| Hosting | Vercel (Git integration) |

## Local development

```bash
npm install
cp .env.example .env.local   # fill in the values below
npm run dev                  # http://localhost:3000
```

Other scripts: `npm run build`, `npm run start`, `npm run lint`, `npx tsc --noEmit`.

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
| `REVALIDATION_SECRET` | server | Shared secret for the manual `/api/revalidate` endpoint |
| `NEXT_PUBLIC_SITE_URL` | build | Optional canonical origin. Leave unset on Vercel (the production URL is used automatically); set it when a custom domain exists. |

## Firebase setup

1. **Firestore** is enabled. Deploy the rules and composite indexes from this repo (requires `firebase login`):
   ```bash
   npx firebase-tools deploy --only firestore
   ```
   Without the indexes, published-recipe queries fail and the site silently falls back to sample data (errors are logged server-side with an index-creation link).
2. **Authentication**: enable the Google provider, then add every domain the admin will sign in from (for example `foodwithruks.vercel.app`) under Authentication → Settings → Authorized domains.
3. **Storage** is not enabled (Blaze plan required). Admin editors use image URL fields.

Collections: `recipes`, `lifestylePosts`, `comments`, `contactMessages`, `subscribers`, `siteSettings/general`.

## Deploying (Vercel)

The Vercel project is connected to this GitHub repository. Every push to `main` is a production deploy; every other branch gets a preview URL (see the deployment status on the commit in GitHub). Work on a branch, check the preview, then merge.

Environment variables live in the Vercel project settings (Production + Preview). After the first deploy on a new domain, add that domain to Firebase Auth authorized domains or admin login fails with `auth/unauthorized-domain`.

## Admin

`/admin/login` uses Google sign-in. Access is granted only to emails listed in `ADMIN_EMAIL`. The admin manages recipes, lifestyle posts, comments, contact messages, newsletter subscribers (with CSV export) and site settings (the pinned "New Recipe of the Week" and Instagram handle).

## Project docs

- `CLAUDE.md` — current project state and conventions (read first)
- `INSTRUCTIONS.md` — design system, architecture and data models
- `TASKS.md` — task tracker
