import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_BYLINE, TAGLINE_PRIMARY } from "@/lib/site";

export const alt = `${SITE_NAME} — ${TAGLINE_PRIMARY}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Tries to load Lora from Google Fonts at request time so the OG card matches the site.
 * Falls back to the default font if the fetch fails — the image must never 500.
 */
async function loadLora(): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch("https://fonts.googleapis.com/css2?family=Lora:wght@600&display=swap", {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36" },
    }).then((r) => r.text());
    const match = css.match(/src: url\((https:[^)]+\.(?:ttf|woff))\)/);
    if (!match) return null;
    const res = await fetch(match[1]);
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch {
    return null;
  }
}

export default async function OpenGraphImage() {
  const lora = await loadLora();
  const fonts = lora ? [{ name: "Lora", data: lora, weight: 600 as const, style: "normal" as const }] : undefined;
  const serif = lora ? "Lora" : "Georgia, 'Times New Roman', serif";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #EECFCA 0%, #FCFBF8 45%, #E4E8DD 100%)",
          color: "#2A2D22",
          fontFamily: serif,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 40,
            left: 40,
            right: 40,
            bottom: 40,
            border: "2px solid rgba(89, 94, 72, 0.25)",
            borderRadius: 32,
          }}
        />
        <div style={{ display: "flex", fontSize: 30, fontStyle: "italic", color: "#8F624B", marginBottom: 18 }}>
          {SITE_BYLINE}
        </div>
        <div style={{ display: "flex", fontSize: 128, fontWeight: 600, letterSpacing: -3, lineHeight: 1 }}>
          <span>Agooh</span>
          <span style={{ color: "#C7A491", margin: "0 28px" }}>&amp;</span>
          <span>Ruks</span>
        </div>
        <div style={{ display: "flex", fontSize: 40, color: "#595E48", marginTop: 28 }}>{TAGLINE_PRIMARY}</div>
      </div>
    ),
    { ...size, fonts }
  );
}
