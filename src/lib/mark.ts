/**
 * The squish: a round bake with two closed, smiling eyes and rosy cheeks,
 * one bite out of the top-right edge so it is hers and not an emoji.
 * Pure geometry (no React) so the favicon, the OG image and the component
 * all draw the same thing. viewBox is 0 0 64 64.
 */

export type MarkState = "open" | "squished" | "asleep";

export const MARK_VIEWBOX = "0 0 64 64";

export const MARK = {
  body: { cx: 32, cy: 34, r: 26 },
  bite: { cx: 50, cy: 14, r: 8.5 },
  crumbs: [
    { cx: 58.5, cy: 21, r: 1.4 },
    { cx: 54, cy: 8, r: 1.1 },
  ],
  cheeks: [
    { cx: 17, cy: 41, r: 4.6 },
    { cx: 47, cy: 41, r: 4.6 },
  ],
  eyeStroke: 3.6,
  bodyStroke: 2.6,
} as const;

/** Eye paths per state: closed smiling arcs, open dots (drawn as short strokes), or flat lines. */
export function eyePaths(state: MarkState): string[] {
  switch (state) {
    case "open":
      // Round dots via zero-length stroked lines (round caps make them circles)
      return ["M24 31.5 h0.01", "M40 31.5 h0.01"];
    case "asleep":
      return ["M18.5 32.5 h11", "M34.5 32.5 h11"];
    case "squished":
    default:
      return ["M18.5 33.5 q5.5 -6.5 11 0", "M34.5 33.5 q5.5 -6.5 11 0"];
  }
}

/** Stroke width for the eyes in a given state (dots need to be fatter to read at 16px). */
export function eyeStroke(state: MarkState): number {
  return state === "open" ? 5.2 : MARK.eyeStroke;
}

/**
 * Standalone SVG markup (for the favicon and static files). Colours are literal because
 * favicons cannot read the page's CSS variables.
 */
export function markSvg(
  state: MarkState,
  colors: { body: string; ink: string; cheek: string; crumbs?: boolean } = {
    body: "#E3C4A6",
    ink: "#2B1E1B",
    cheek: "#EBB2B0",
  }
): string {
  const { body, bite, cheeks, crumbs } = MARK;
  const eyes = eyePaths(state)
    .map((d) => `<path d="${d}" fill="none" stroke="${colors.ink}" stroke-width="${eyeStroke(state)}" stroke-linecap="round"/>`)
    .join("");
  const crumbSvg = colors.crumbs
    ? crumbs.map((c) => `<circle cx="${c.cx}" cy="${c.cy}" r="${c.r}" fill="${colors.body}" stroke="${colors.ink}" stroke-width="1"/>`).join("")
    : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${MARK_VIEWBOX}" role="img" aria-label="Agooh and Ruks">
<mask id="bite"><rect width="64" height="64" fill="white"/><circle cx="${bite.cx}" cy="${bite.cy}" r="${bite.r}" fill="black"/></mask>
<g mask="url(#bite)"><circle cx="${body.cx}" cy="${body.cy}" r="${body.r}" fill="${colors.body}" stroke="${colors.ink}" stroke-width="${MARK.bodyStroke}"/></g>
<path d="M${bite.cx - bite.r * 0.62} ${bite.cy + bite.r * 0.78} a${bite.r} ${bite.r} 0 0 0 ${bite.r * 1.32} -${bite.r * 0.35}" fill="none" stroke="${colors.ink}" stroke-width="${MARK.bodyStroke}" stroke-linecap="round"/>
${cheeks.map((c) => `<circle cx="${c.cx}" cy="${c.cy}" r="${c.r}" fill="${colors.cheek}"/>`).join("")}
${eyes}${crumbSvg}
</svg>`;
}
