/**
 * Light / dark mode only. The palette picker is gone: there is one palette
 * (Daylight and After hours) defined in src/styles/globals.css.
 * Isomorphic (no browser APIs).
 */

export const MODES = ["light", "dark", "system"] as const;
export type ThemeMode = (typeof MODES)[number];
export type ResolvedMode = "light" | "dark";

/** Follows the visitor's device. Change to "dark" for dark by default. */
export const DEFAULT_MODE: ThemeMode = "system";

export function isThemeMode(value: unknown): value is ThemeMode {
  return typeof value === "string" && (MODES as readonly string[]).includes(value);
}
