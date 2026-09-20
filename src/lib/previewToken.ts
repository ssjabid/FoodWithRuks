import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Signed links for previewing drafts on the public site before publishing.
 * Token = HMAC-SHA256(type:slug, REVALIDATION_SECRET). Nobody can forge a link
 * without the server secret, and a link only ever opens the one item it was
 * made for. Server-only (node:crypto).
 */

export type PreviewType = "recipe" | "post";

function secret(): string {
  const s = process.env.REVALIDATION_SECRET;
  if (!s) throw new Error("REVALIDATION_SECRET is not set");
  return s;
}

export function makePreviewToken(type: PreviewType, slug: string): string {
  return createHmac("sha256", secret()).update(`${type}:${slug}`).digest("base64url").slice(0, 32);
}

export function verifyPreviewToken(type: PreviewType, slug: string, token: string | undefined): boolean {
  if (!token || token.length !== 32) return false;
  try {
    const expected = Buffer.from(makePreviewToken(type, slug));
    const given = Buffer.from(token);
    return expected.length === given.length && timingSafeEqual(expected, given);
  } catch {
    return false;
  }
}

export function previewPath(type: PreviewType, slug: string): string {
  return `/preview/${type}/${encodeURIComponent(slug)}/${makePreviewToken(type, slug)}`;
}
