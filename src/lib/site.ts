/**
 * Brand + site configuration — the single source of truth for everything
 * that identifies the site (name, taglines, URL, socials, storage keys).
 * Safe to import from both server and client code.
 */

export const SITE_NAME = "Agooh & Ruks";
export const SITE_BYLINE = "Pass the Butter, Ruks";
export const TAGLINE_PRIMARY = "Pure comfort, cooked simply";
export const TAGLINE_SECONDARY = "Warmth in every bite";
export const SITE_DESCRIPTION =
  "Pure comfort, cooked simply. Wholesome, easy-to-follow recipes and family life from Agooh & Ruks.";
export const AUTHOR_NAME = "Ruks";

/**
 * Canonical site origin (no trailing slash).
 * Resolution order:
 *  1. NEXT_PUBLIC_SITE_URL   — set this in Vercel once a custom domain exists
 *  2. VERCEL_PROJECT_PRODUCTION_URL — provided automatically by Vercel
 *  3. The current production host
 */
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/+$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel.replace(/\/+$/, "")}`;
  return "https://foodwithruks.vercel.app";
}
export const SITE_URL = resolveSiteUrl();

export const SOCIAL_LINKS = {
  instagram: {
    label: "Instagram",
    handle: "@foodwithruks",
    url: "https://instagram.com/foodwithruks",
  },
} as const;

/**
 * Where uploaded photos are committed (public repo). Client-safe; the server
 * reads GITHUB_REPO/GITHUB_BRANCH for the real values, these are the defaults.
 */
export const CONTENT_REPO = { repo: "ssjabid/FoodWithRuks", branch: "main" } as const;

/** Raw GitHub URL for a repo path, e.g. "public/images/uploads/..." — available seconds after upload. */
export function rawContentUrl(repoPath: string): string {
  return `https://raw.githubusercontent.com/${CONTENT_REPO.repo}/${CONTENT_REPO.branch}/${repoPath}`;
}

/** localStorage keys — namespaced so a future rebrand can't collide. */
export const STORAGE_KEYS = {
  /** legacy light|dark key, migrated to mode on first read */
  theme: "ar_theme",
  mode: "ar_mode",
  palette: "ar_palette",
  favorites: "ar_favorites",
  /** set once the visitor has opened the palette panel (hides the "new" dot) */
  pickerSeen: "ar_picker_seen",
} as const;
