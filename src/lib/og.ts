import { markSvg, type MarkState } from "@/lib/mark";
import { SITE_URL } from "@/lib/site";
import { TOKENS } from "@/lib/tokens";

/**
 * Shared bits for the generated images (Open Graph cards, the Apple touch icon).
 * Colours come from src/lib/tokens.ts (generated from globals.css), so they follow the palette.
 */
const L = TOKENS.light;

export const OG = {
  ground: L.ground,
  surface: L.surface,
  text: L.text,
  text2: L["text-2"],
  cheek: L.cheek,
  blush: L.blush,
  line: L.line,
} as const;

/** The mark as a data URL so Satori can draw it with an <img>. */
export function markDataUrl(state: MarkState = "squished"): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(markSvg(state, { body: L["mark-body"], ink: L["mark-ink"], cheek: L["mark-cheek"] }))}`;
}

/**
 * Loads Lora from Google Fonts at request time so the cards match the site.
 * A plain user agent makes Google serve a TrueType file (Satori cannot read woff2).
 * Returns null when the fetch fails: the image must never 500.
 */
export async function loadLora(weight: 500 | 600 = 500): Promise<ArrayBuffer | null> {
  return loadDisplayFont("Lora", weight);
}

export async function loadDisplayFont(family: string, weight: number): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(`https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}&display=swap`, {
      headers: { "User-Agent": "Mozilla/5.0" },
      cache: "force-cache",
    }).then((r) => r.text());
    const match = css.match(/src: url\((https:[^)]+\.(?:ttf|otf|woff))\)/);
    if (!match) return null;
    const res = await fetch(match[1], { cache: "force-cache" });
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch {
    return null;
  }
}

/** Site-relative upload paths become absolute so the image route can fetch them. */
export function absoluteUrl(src: string): string {
  return src.startsWith("http") ? src : `${SITE_URL}${src.startsWith("/") ? "" : "/"}${src}`;
}

/** Fetches a photo and inlines it (Satori is happiest with data URLs). Null on any problem. */
export async function fetchImageDataUrl(url: string, maxBytes = 4_000_000): Promise<string | null> {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const type = res.headers.get("content-type")?.split(";")[0].trim() || "image/jpeg";
    if (!type.startsWith("image/")) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.byteLength === 0 || buf.byteLength > maxBytes) return null;
    return `data:${type};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}
