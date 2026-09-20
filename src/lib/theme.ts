/**
 * Palette + colour-mode metadata. Isomorphic (no browser APIs) so it can be
 * used by the root layout, the admin settings page and the pickers.
 * The actual colour values live in src/styles/globals.css.
 */

export const PALETTE_IDS = ["cream", "sage", "blush", "clay", "olive"] as const;
export type PaletteId = (typeof PALETTE_IDS)[number];

export const MODES = ["light", "dark", "system"] as const;
export type ThemeMode = (typeof MODES)[number];
export type ResolvedMode = "light" | "dark";

export const DEFAULT_PALETTE: PaletteId = "cream";
export const DEFAULT_MODE: ThemeMode = "system";

/** Swatches for the mini "page" preview tiles (ground, headline, button, accent). */
export interface PalettePreview {
  bg: string;
  text: string;
  primary: string;
  accent: string;
}

export interface PaletteMeta {
  id: PaletteId;
  label: string;
  /** One-word label for tight spaces (swatch tiles). */
  shortLabel: string;
  description: string;
  preview: { light: PalettePreview; dark: PalettePreview };
}

export const PALETTES: Record<PaletteId, PaletteMeta> = {
  cream: {
    id: "cream",
    label: "Cream & Olive",
    shortLabel: "Cream",
    description: "Warm cream ground, olive type and buttons, clay and blush accents.",
    preview: {
      light: { bg: "#FCFBF8", text: "#2A2D22", primary: "#595E48", accent: "#C7A491" },
      dark: { bg: "#1B1D17", text: "#F1EEE7", primary: "#C7CDBF", accent: "#C7A491" },
    },
  },
  sage: {
    id: "sage",
    label: "Sage",
    shortLabel: "Sage",
    description: "Light sage everywhere, olive type, clay links. The most palette-true.",
    preview: {
      light: { bg: "#F1F2EF", text: "#24261D", primary: "#595E48", accent: "#919682" },
      dark: { bg: "#24261D", text: "#F1F2EF", primary: "#C7CDBF", accent: "#C7A491" },
    },
  },
  blush: {
    id: "blush",
    label: "Blush",
    shortLabel: "Blush",
    description: "Soft pink ground and surfaces, olive buttons, clay links.",
    preview: {
      light: { bg: "#FAF1EF", text: "#322924", primary: "#595E48", accent: "#C7A491" },
      dark: { bg: "#241E1A", text: "#F8ECEA", primary: "#EECFCA", accent: "#C7A491" },
    },
  },
  clay: {
    id: "clay",
    label: "Clay",
    shortLabel: "Clay",
    description: "Earthy clay buttons and links, light sage sections, blush callouts.",
    preview: {
      light: { bg: "#F7F1EE", text: "#322924", primary: "#825540", accent: "#919682" },
      dark: { bg: "#1E1916", text: "#F7F1EE", primary: "#C7A491", accent: "#C7CDBF" },
    },
  },
  olive: {
    id: "olive",
    label: "Evening Olive",
    shortLabel: "Olive",
    description: "Sage ground with deep olive bands; dark mode is olive itself.",
    preview: {
      light: { bg: "#E9EBE5", text: "#24261D", primary: "#595E48", accent: "#C7A491" },
      dark: { bg: "#474B3A", text: "#F9FAF9", primary: "#EECFCA", accent: "#C7A491" },
    },
  },
};

export function isPaletteId(value: unknown): value is PaletteId {
  return typeof value === "string" && (PALETTE_IDS as readonly string[]).includes(value);
}

export function isThemeMode(value: unknown): value is ThemeMode {
  return typeof value === "string" && (MODES as readonly string[]).includes(value);
}
