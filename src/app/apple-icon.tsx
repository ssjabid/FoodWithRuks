import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

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
          background: "#595E48",
          borderRadius: 40,
          color: "#F1EEE7",
          fontSize: 84,
          fontWeight: 600,
          fontFamily: "Georgia, 'Times New Roman', serif",
          letterSpacing: -2,
        }}
      >
        <span>A</span>
        <span style={{ color: "#C7A491" }}>&amp;</span>
        <span>R</span>
      </div>
    ),
    { ...size }
  );
}
