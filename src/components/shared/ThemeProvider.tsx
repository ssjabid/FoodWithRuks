"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import type { ResolvedMode, ThemeMode } from "@/lib/theme";
import { getServerSnapshot, getSnapshot, resolveMode, setStoredMode, subscribe } from "@/lib/themeStore";

interface ThemeContextValue {
  mode: ThemeMode;
  resolvedMode: ResolvedMode;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/** Applies the light/dark class to <html> and exposes useTheme(). The no-FOUC script in layout.tsx runs first. */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const resolvedMode = resolveMode(snap.mode, snap.systemDark);
  const firstRun = useRef(true);

  useEffect(() => {
    const root = document.documentElement;
    const isDark = root.classList.contains("dark");
    const wantDark = resolvedMode === "dark";
    if (!firstRun.current && isDark !== wantDark) {
      root.classList.add("theme-transition");
      const t = window.setTimeout(() => root.classList.remove("theme-transition"), 320);
      root.classList.toggle("dark", wantDark);
      return () => window.clearTimeout(t);
    }
    firstRun.current = false;
    root.classList.toggle("dark", wantDark);
  }, [resolvedMode]);

  const value = useMemo<ThemeContextValue>(
    () => ({ mode: snap.mode, resolvedMode, setMode: setStoredMode }),
    [snap.mode, resolvedMode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}
