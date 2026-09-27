"use client";

import { STORAGE_KEYS } from "@/lib/site";
import { DEFAULT_MODE, isThemeMode, type ResolvedMode, type ThemeMode } from "@/lib/theme";

/**
 * Tiny external store for the visitor's light/dark choice, read through
 * useSyncExternalStore so server and first client render agree.
 * Old keys from the palette-picker era are removed once.
 */

export interface ThemeSnapshot {
  mode: ThemeMode;
  systemDark: boolean;
}

const LEGACY_KEYS = ["ar_palette", "ar_picker_seen"];

const listeners = new Set<() => void>();
let snapshot: ThemeSnapshot | null = null;
let mediaQuery: MediaQueryList | null = null;

const SERVER_SNAPSHOT: ThemeSnapshot = { mode: DEFAULT_MODE, systemDark: false };

function cleanupLegacy() {
  try {
    const legacyMode = localStorage.getItem(STORAGE_KEYS.theme);
    if (legacyMode && !localStorage.getItem(STORAGE_KEYS.mode) && isThemeMode(legacyMode)) {
      localStorage.setItem(STORAGE_KEYS.mode, legacyMode);
    }
    localStorage.removeItem(STORAGE_KEYS.theme);
    for (const k of LEGACY_KEYS) localStorage.removeItem(k);
  } catch {
    /* storage unavailable */
  }
}

function read(): ThemeSnapshot {
  let mode: ThemeMode = DEFAULT_MODE;
  try {
    const m = localStorage.getItem(STORAGE_KEYS.mode);
    if (isThemeMode(m)) mode = m;
  } catch {
    /* storage unavailable */
  }
  return { mode, systemDark: mediaQuery ? mediaQuery.matches : false };
}

function emit() {
  snapshot = read();
  listeners.forEach((l) => l());
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  if (!mediaQuery && typeof window !== "undefined") {
    cleanupLegacy();
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

export function setStoredMode(mode: ThemeMode) {
  try {
    localStorage.setItem(STORAGE_KEYS.mode, mode);
  } catch {
    /* ignore */
  }
  emit();
}

export function resolveMode(mode: ThemeMode, systemDark: boolean): ResolvedMode {
  if (mode === "system") return systemDark ? "dark" : "light";
  return mode;
}
