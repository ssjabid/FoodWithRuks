"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import type { PaletteId, ResolvedMode, ThemeMode } from "@/lib/theme";
import {
  getServerSnapshot,
  getSnapshot,
  resolveMode,
  setStoredMode,
  setStoredPalette,
  subscribe,
} from "@/lib/themeStore";

interface ThemeContextValue {
  /** Palette in effect (visitor choice, else the site default). */
  palette: PaletteId;
  /** Site default chosen in admin. */
  defaultPalette: PaletteId;
  mode: ThemeMode;
  resolvedMode: ResolvedMode;
  showPicker: boolean;
  setPalette: (palette: PaletteId) => void;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  defaultPalette: PaletteId;
  showPicker: boolean;
  children: React.ReactNode;
}

export function ThemeProvider({ defaultPalette, showPicker, children }: ThemeProviderProps) {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const palette = snap.palette ?? defaultPalette;
  const resolvedMode = resolveMode(snap.mode, snap.systemDark);
  const firstRun = useRef(true);

  // Apply to <html>. The inline no-FOUC script already did this before paint;
  // this keeps it in sync after user changes and system changes.
  useEffect(() => {
    const root = document.documentElement;
    const changed = root.dataset.palette !== palette || root.classList.contains("dark") !== (resolvedMode === "dark");
    if (!firstRun.current && changed) {
      root.classList.add("theme-transition");
      const t = window.setTimeout(() => root.classList.remove("theme-transition"), 320);
      root.dataset.palette = palette;
      root.classList.toggle("dark", resolvedMode === "dark");
      return () => window.clearTimeout(t);
    }
    firstRun.current = false;
    root.dataset.palette = palette;
    root.classList.toggle("dark", resolvedMode === "dark");
  }, [palette, resolvedMode]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      palette,
      defaultPalette,
      mode: snap.mode,
      resolvedMode,
      showPicker,
      setPalette: (p) => setStoredPalette(p === defaultPalette ? null : p),
      setMode: setStoredMode,
    }),
    [palette, defaultPalette, snap.mode, resolvedMode, showPicker]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}
