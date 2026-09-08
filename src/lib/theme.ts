/**
 * Palette + colour-mode metadata. Isomorphic (no browser APIs) so it can be
 * used by the root layout, the admin settings page and the drawer picker.
 * The actual colour values live in src/styles/globals.css.
 */

export const PALETTE_IDS = ["cream", "sage", "blush", "clay", "olive"] as const;
export type PaletteId = (typeof PALETTE_IDS)[number];

export const MODES = ["light", "dark", "system"] as const;
export type ThemeMode = (typeof MODES)[number];
export type ResolvedMode = "light" | "dark";

export const DEFAULT_PALETTE: PaletteId = "cream";
export const DEFAULT_MODE: ThemeMode = "system";

export interface PaletteMeta {
  id: PaletteId;
  label: string;
  description: string;
  /** [background, primary, accent] swatches for the mini preview */
  preview: { light: [string, string, string]; dark: [string, string, string] };
}

export const PALETTES: Record<PaletteId, PaletteMeta> = {
  cream: {
    id: "cream",
    label: "Cream & Olive",
    description: "Warm cream ground, olive type and buttons, clay and blush accents.",
    preview: { light: ["#FCFBF8", "#595E48", "#C7A491"], dark: ["#1B1D17", "#C7CDBF", "#C7A491"] },
  },
  sage: {
    id: "sage",
    label: "Sage",
    description: "Light sage everywhere, olive type, clay links. The most palette-true.",
    preview: { light: ["#F1F2EF", "#595E48", "#919682"], dark: ["#24261D", "#C7CDBF", "#C7A491"] },
  },
  blush: {
    id: "blush",
    label: "Blush",
    description: "Soft pink ground and surfaces, olive buttons, clay links.",
    preview: { light: ["#FAF1EF", "#595E48", "#C7A491"], dark: ["#241E1A", "#EECFCA", "#C7A491"] },
  },
  clay: {
    id: "clay",
    label: "Clay",
    description: "Earthy clay buttons and links, light sage sections, blush callouts.",
    preview: { light: ["#F7F1EE", "#825540", "#919682"], dark: ["#1E1916", "#C7A491", "#C7CDBF"] },
  },
  olive: {
    id: "olive",
    label: "Evening Olive",
    description: "Sage ground with deep olive bands; dark mode is olive itself.",
    preview: { light: ["#E9EBE5", "#595E48", "#C7A491"], dark: ["#474B3A", "#EECFCA", "#C7A491"] },
  },
};

export function isPaletteId(value: unknown): value is PaletteId {
  return typeof value === "string" && (PALETTE_IDS as readonly string[]).includes(value);
}

export function isThemeMode(value: unknown): value is ThemeMode {
  return typeof value === "string" && (MODES as readonly string[]).includes(value);
}
