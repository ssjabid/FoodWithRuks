"use client";

import { useEffect, useReducer, useRef } from "react";
import { createPortal } from "react-dom";
import { PALETTES } from "@/lib/theme";
import { STORAGE_KEYS } from "@/lib/site";
import { useIsClient } from "@/hooks/useIsClient";
import { useTheme } from "./ThemeProvider";
import { MODE_LABEL, ModeSwitch, PaletteSwatches } from "./ThemePicker";

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

function readSeen() {
  try {
    return localStorage.getItem(STORAGE_KEYS.pickerSeen) === "1";
  } catch {
    return true;
  }
}

/**
 * Header palette button + popover. Shown while the site is still choosing a
 * palette (siteSettings.showThemePicker). The button is a live swatch of the
 * current palette, so the feature is visible without a label.
 */
export function ThemePanel() {
  const { palette, mode, resolvedMode } = useTheme();
  const isClient = useIsClient();
  const [open, setOpen] = useReducer((_: boolean, next: boolean) => next, false);
  const [, rerender] = useReducer((n: number) => n + 1, 0);
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const p = PALETTES[palette].preview[resolvedMode];
  const seen = isClient ? readSeen() : true;

  const openPanel = () => {
    try {
      localStorage.setItem(STORAGE_KEYS.pickerSeen, "1");
    } catch {
      /* ignore */
    }
    rerender();
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
    btnRef.current?.focus();
  };

  // Escape closes; Tab stays inside the panel
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
      return;
    }
    if (e.key !== "Tab" || !panelRef.current) return;
    const nodes = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
    if (nodes.length === 0) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  // Focus the selected swatch once the panel is open
  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => {
      const selected = panelRef.current?.querySelector<HTMLElement>('[role="radio"][aria-checked="true"]');
      (selected ?? panelRef.current?.querySelector<HTMLElement>(FOCUSABLE))?.focus();
    }, 30);
    return () => window.clearTimeout(t);
  }, [open]);

  const state = open ? "open" : "closed";
  const label = `Appearance: ${PALETTES[palette].label}, ${MODE_LABEL[mode]}`;

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => (open ? close() : openPanel())}
        aria-label={label}
        title="Choose a palette"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="theme-panel"
        className="theme-toggle relative w-10 h-10 rounded-full flex items-center justify-center hover:bg-[var(--color-secondary)] transition-colors"
      >
        <span
          className="block w-5 h-5 rounded-full border border-[var(--color-border)]"
          style={{ background: `conic-gradient(${p.primary} 0 50%, ${p.accent} 50% 75%, ${p.bg} 75% 100%)` }}
          aria-hidden="true"
        />
        {!seen && (
          <span
            className="absolute top-1.5 right-1.5 block w-2 h-2 rounded-full bg-[var(--color-accent-text)] ring-2 ring-[var(--color-background)]"
            aria-hidden="true"
          />
        )}
      </button>

      {isClient &&
        createPortal(
          <>
            <div className="popover-backdrop z-[60]" data-state={state} onClick={close} aria-hidden="true" />
            <div
              ref={panelRef}
              id="theme-panel"
              role="dialog"
              aria-modal="true"
              aria-label="Appearance"
              aria-hidden={!open}
              inert={!open}
              data-state={state}
              onKeyDown={onKeyDown}
              className="popover-panel fixed z-[70] top-16 left-4 right-4 sm:left-auto sm:right-6 sm:w-[400px] rounded-[var(--radius-lg)] bg-[var(--color-elevated)] border border-[var(--color-border)] p-4 sm:p-5"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <p className="eyebrow mb-1">Appearance</p>
                  <h2 className="h-card text-[var(--color-text-primary)]">Pick a look</h2>
                  <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                    Five palettes, light or dark. Your choice is remembered on this device.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close"
                  className="w-9 h-9 -mr-2 -mt-1 shrink-0 rounded-full flex items-center justify-center hover:bg-[var(--color-secondary)] transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <PaletteSwatches className="mb-4" />
              <ModeSwitch />

              <p className="mt-4 text-xs text-[var(--color-text-tertiary)]">
                Now showing{" "}
                <span className="font-medium text-[var(--color-text-secondary)]">{PALETTES[palette].label}</span>
                {" — "}
                {PALETTES[palette].description}
              </p>
            </div>
          </>,
          document.body
        )}
    </>
  );
}
