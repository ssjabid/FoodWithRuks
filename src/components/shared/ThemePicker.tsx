"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/utils";
import { MODES, PALETTES, PALETTE_IDS, type ThemeMode } from "@/lib/theme";
import { useTheme } from "./ThemeProvider";
import { Chevron } from "@/components/ui/Chevron";

export const MODE_LABEL: Record<ThemeMode, string> = { light: "Light", dark: "Dark", system: "System" };

/** Five palette tiles, each a tiny "page" (ground, headline, button, accent). */
export function PaletteSwatches({ className }: { className?: string }) {
  const { palette, resolvedMode, setPalette } = useTheme();

  return (
    <div role="radiogroup" aria-label="Colour palette" className={cn("grid grid-cols-5 gap-1.5 sm:gap-2", className)}>
      {PALETTE_IDS.map((id) => {
        const meta = PALETTES[id];
        const p = meta.preview[resolvedMode];
        const selected = id === palette;
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={meta.label}
            title={meta.description}
            onClick={() => setPalette(id)}
            className={cn(
              "flex flex-col items-center gap-1.5 rounded-[var(--radius-md)] p-1 border-2 transition-colors",
              selected ? "border-[var(--color-primary)]" : "border-transparent hover:border-[var(--color-border)]"
            )}
          >
            <span
              className="flex w-full aspect-[4/3] flex-col justify-between rounded-[var(--radius-sm)] border border-[var(--color-border)] p-1.5"
              style={{ background: p.bg }}
              aria-hidden="true"
            >
              <span className="block h-1.5 w-3/4 rounded-full" style={{ background: p.text }} />
              <span className="flex items-center gap-1">
                <span className="block h-2.5 w-6 rounded-full" style={{ background: p.primary }} />
                <span className="block h-2.5 w-2.5 rounded-full" style={{ background: p.accent }} />
              </span>
            </span>
            <span
              className={cn(
                "text-[11px] sm:text-xs leading-tight text-center",
                selected ? "font-medium text-[var(--color-text-primary)]" : "text-[var(--color-text-secondary)]"
              )}
            >
              {meta.shortLabel}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** Light / Dark / System segmented control. */
export function ModeSwitch({ className }: { className?: string }) {
  const { mode, setMode } = useTheme();
  return (
    <div
      role="radiogroup"
      aria-label="Colour mode"
      className={cn("grid grid-cols-3 rounded-full border border-[var(--color-border)] p-0.5", className)}
    >
      {MODES.map((m) => {
        const selected = m === mode;
        return (
          <button
            key={m}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => setMode(m)}
            className={cn(
              "h-9 rounded-full text-sm font-medium inline-flex items-center justify-center gap-1.5 transition-colors",
              selected
                ? "bg-[var(--color-primary)] text-[var(--color-on-primary)]"
                : "text-[var(--color-text-secondary)] hover:bg-[var(--color-secondary)]"
            )}
          >
            <ModeIcon mode={m} />
            {MODE_LABEL[m]}
          </button>
        );
      })}
    </div>
  );
}

function ModeIcon({ mode }: { mode: ThemeMode }) {
  const common = {
    className: "w-4 h-4",
    fill: "none",
    viewBox: "0 0 24 24",
    stroke: "currentColor",
    strokeWidth: 1.8,
    "aria-hidden": true as const,
  };
  if (mode === "light") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="4" />
        <path strokeLinecap="round" d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
      </svg>
    );
  }
  if (mode === "dark") {
    return (
      <svg {...common}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 14.5A8 8 0 019.5 4a8 8 0 1010.5 10.5z" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <rect x="3" y="5" width="18" height="12" rx="2" />
      <path strokeLinecap="round" d="M8 20h8M12 17v3" />
    </svg>
  );
}

/** Expandable "Appearance" section for the nav drawer (open by default while the site is choosing a palette). */
export function ThemePicker({ defaultOpen = true }: { defaultOpen?: boolean }) {
  const { palette, mode } = useTheme();
  const [open, setOpen] = useState(defaultOpen);
  const bodyId = useId();

  return (
    <div className="border-t border-[var(--color-border)]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={bodyId}
        className="flex w-full items-center justify-between px-5 py-3.5 text-left hover:bg-[var(--color-secondary)] transition-colors"
      >
        <span className="flex items-baseline gap-3">
          <span className="eyebrow">Appearance</span>
          <span className="text-sm text-[var(--color-text-secondary)]">
            {PALETTES[palette].label} · {MODE_LABEL[mode]}
          </span>
        </span>
        <Chevron open={open} className="w-4 h-4 text-[var(--color-text-tertiary)]" />
      </button>

      <div id={bodyId} className="accordion" data-open={open}>
        <div>
          <div className="px-4 pb-5 space-y-4">
            <PaletteSwatches />
            <ModeSwitch />
          </div>
        </div>
      </div>
    </div>
  );
}
