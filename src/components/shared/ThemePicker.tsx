"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/utils";
import { MODES, PALETTES, PALETTE_IDS, type ThemeMode } from "@/lib/theme";
import { useTheme } from "./ThemeProvider";
import { Chevron } from "@/components/ui/Chevron";

const MODE_LABEL: Record<ThemeMode, string> = { light: "Light", dark: "Dark", system: "System" };

/** Expandable "Appearance" section for the nav drawer: palette swatches + light/dark/system. */
export function ThemePicker({ defaultOpen = false }: { defaultOpen?: boolean }) {
  const { palette, mode, resolvedMode, setPalette, setMode } = useTheme();
  const [open, setOpen] = useState(defaultOpen);
  const bodyId = useId();

  return (
    <div className="border-t border-[var(--color-border)]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={bodyId}
        className="flex w-full items-center justify-between px-5 py-3 text-left hover:bg-[var(--color-secondary)] transition-colors"
      >
        <span className="flex items-center gap-3">
          <span className="eyebrow">Appearance</span>
          <span className="text-sm text-[var(--color-text-secondary)]">
            {PALETTES[palette].label} · {MODE_LABEL[mode]}
          </span>
        </span>
        <Chevron open={open} className="w-4 h-4 text-[var(--color-text-tertiary)]" />
      </button>

      <div id={bodyId} className="accordion" data-open={open}>
        <div>
          <div className="px-5 pb-4 space-y-4">
            <div role="radiogroup" aria-label="Colour palette" className="grid grid-cols-5 gap-2">
              {PALETTE_IDS.map((id) => {
                const meta = PALETTES[id];
                const [bg, primary, accent] = meta.preview[resolvedMode];
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
                      "flex flex-col items-center gap-1.5 rounded-[var(--radius-md)] p-1.5 border transition-colors",
                      selected
                        ? "border-[var(--color-primary)] bg-[var(--color-secondary)]"
                        : "border-transparent hover:bg-[var(--color-secondary)]"
                    )}
                  >
                    <span
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-border)] overflow-hidden"
                      style={{ background: bg }}
                      aria-hidden="true"
                    >
                      <span className="h-3.5 w-3.5 rounded-full" style={{ background: primary }} />
                      <span className="h-2.5 w-2.5 rounded-full -ml-1 mt-3" style={{ background: accent }} />
                    </span>
                    <span className="text-[10px] leading-tight text-center text-[var(--color-text-secondary)]">
                      {meta.label.replace(" & Olive", "").replace("Evening ", "")}
                    </span>
                  </button>
                );
              })}
            </div>

            <div role="radiogroup" aria-label="Colour mode" className="inline-flex rounded-full border border-[var(--color-border)] p-0.5">
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
                      "h-8 px-3 rounded-full text-xs font-medium transition-colors",
                      selected
                        ? "bg-[var(--color-primary)] text-[var(--color-on-primary)]"
                        : "text-[var(--color-text-secondary)] hover:bg-[var(--color-secondary)]"
                    )}
                  >
                    {MODE_LABEL[m]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
