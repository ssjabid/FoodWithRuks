import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_BYLINE } from "@/lib/site";
import { OG, loadLora, markDataUrl } from "@/lib/og";

export const alt = SITE_NAME;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** The site card: the mark, the wordmark with its cheek ampersand, the byline. */
export default async function OpenGraphImage() {
  const lora = await loadLora(500);
  const fonts = lora ? [{ name: "Lora", data: lora, weight: 500 as const, style: "normal" as const }] : undefined;
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
          background: OG.ground,
          color: OG.text,
          fontFamily: serif,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={markDataUrl()} width={190} height={190} alt="" />
        <div style={{ display: "flex", fontSize: 116, fontWeight: 500, letterSpacing: -2, lineHeight: 1, marginTop: 28 }}>
          <span>Agooh</span>
          <span style={{ color: OG.cheek, margin: "0 26px" }}>&amp;</span>
          <span>Ruks</span>
        </div>
        <div style={{ display: "flex", fontSize: 36, color: OG.text2, marginTop: 30 }}>{SITE_BYLINE}</div>
      </div>
    ),
    { ...size, fonts }
  );
}
