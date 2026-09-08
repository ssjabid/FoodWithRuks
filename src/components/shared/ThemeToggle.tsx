"use client";

import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { resolvedMode, setMode } = useTheme();
  const dark = resolvedMode === "dark";

  return (
    <button
      type="button"
      onClick={() => setMode(dark ? "light" : "dark")}
      className="theme-toggle w-10 h-10 rounded-full flex items-center justify-center text-[var(--color-text-primary)] hover:bg-[var(--color-secondary)] transition-colors"
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {dark ? (
        <svg key="sun" className="w-5 h-5 fade-in" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path strokeLinecap="round" d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
        </svg>
      ) : (
        <svg key="moon" className="w-5 h-5 fade-in" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 14.5A8 8 0 019.5 4a8 8 0 1010.5 10.5z" />
        </svg>
      )}
    </button>
  );
}
