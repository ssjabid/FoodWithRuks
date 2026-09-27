import { markSvg, type MarkState } from "@/lib/mark";
import { SITE_URL } from "@/lib/site";

/**
 * Shared bits for the generated images (Open Graph cards, the Apple touch icon).
 * Colours are literal because these render outside the page's CSS; keep them in
 * step with the Daylight tokens in globals.css.
 */
export const OG = {
  ground: "#FFFAF8",
  surface: "#F8EFEC",
  text: "#2B1E1B",
  text2: "#5E4843",
  cheek: "#9E3A53",
  blush: "#EECFCA",
  line: "#EBDAD4",
} as const;

/** The mark as a data URL so Satori can draw it with an <img>. */
export function markDataUrl(state: MarkState = "squished"): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(markSvg(state))}`;
}

/**
 * Loads Lora from Google Fonts at request time so the cards match the site.
 * A plain user agent makes Google serve a TrueType file (Satori cannot read woff2).
 * Returns null when the fetch fails: the image must never 500.
 */
export async function loadLora(weight: 500 | 600 = 500): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(`https://fonts.googleapis.com/css2?family=Lora:wght@${weight}&display=swap`, {
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
