"use client";

import { STORAGE_KEYS } from "@/lib/site";
import {
  DEFAULT_MODE,
  DEFAULT_PALETTE,
  isPaletteId,
  isThemeMode,
  type PaletteId,
  type ResolvedMode,
  type ThemeMode,
} from "@/lib/theme";

/**
 * Tiny external store for the visitor's theme choice. Read through
 * useSyncExternalStore so server + first client render agree (defaults),
 * then the real stored values apply after hydration.
 */

export interface ThemeSnapshot {
  palette: PaletteId | null; // null = follow the site default
  mode: ThemeMode;
  systemDark: boolean;
}

const listeners = new Set<() => void>();
let snapshot: ThemeSnapshot | null = null;
let mediaQuery: MediaQueryList | null = null;

const SERVER_SNAPSHOT: ThemeSnapshot = { palette: null, mode: DEFAULT_MODE, systemDark: false };

function read(): ThemeSnapshot {
  let palette: PaletteId | null = null;
  let mode: ThemeMode = DEFAULT_MODE;
  try {
    const p = localStorage.getItem(STORAGE_KEYS.palette);
    if (isPaletteId(p)) palette = p;
    const m = localStorage.getItem(STORAGE_KEYS.mode) ?? localStorage.getItem(STORAGE_KEYS.theme);
    if (isThemeMode(m)) mode = m;
  } catch {
    /* storage unavailable */
  }
  const systemDark = mediaQuery ? mediaQuery.matches : false;
  return { palette, mode, systemDark };
}

function emit() {
  snapshot = read();
  listeners.forEach((l) => l());
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  if (!mediaQuery && typeof window !== "undefined") {
    mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", emit);
    window.addEventListener("storage", emit);
    snapshot = read();
  }
  return () => listeners.delete(listener);
}

export function getSnapshot(): ThemeSnapshot {
  if (!snapshot) {
    if (typeof window === "undefined") return SERVER_SNAPSHOT;
    if (!mediaQuery) mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    snapshot = read();
  }
  return snapshot;
}

export function getServerSnapshot(): ThemeSnapshot {
  return SERVER_SNAPSHOT;
}

export function setStoredPalette(palette: PaletteId | null) {
  try {
    if (palette) localStorage.setItem(STORAGE_KEYS.palette, palette);
    else localStorage.removeItem(STORAGE_KEYS.palette);
  } catch {
    /* ignore */
  }
  emit();
}

export function setStoredMode(mode: ThemeMode) {
  try {
    localStorage.setItem(STORAGE_KEYS.mode, mode);
    localStorage.removeItem(STORAGE_KEYS.theme);
  } catch {
    /* ignore */
  }
  emit();
}

export function resolveMode(mode: ThemeMode, systemDark: boolean): ResolvedMode {
  if (mode === "system") return systemDark ? "dark" : "light";
  return mode;
}

export const DEFAULTS = { palette: DEFAULT_PALETTE, mode: DEFAULT_MODE };
