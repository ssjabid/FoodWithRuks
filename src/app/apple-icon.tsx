import { ImageResponse } from "next/og";
import { OG, markDataUrl } from "@/lib/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** The squish on blush. iOS rounds the corners itself. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: OG.blush,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={markDataUrl()} width={132} height={132} alt="" />
      </div>
    ),
    { ...size }
  );
}
