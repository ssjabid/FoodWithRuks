"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { WHAT_TO_EAT } from "@/lib/constants";
import { buildSearchHref } from "@/lib/search";
import { useIsClient } from "@/hooks/useIsClient";

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const router = useRouter();
  const isClient = useIsClient();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => inputRef.current?.focus(), 30);
    return () => {
      document.body.style.overflow = prev;
      window.clearTimeout(t);
    };
  }, [isOpen]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(buildSearchHref(query));
    setQuery("");
    onClose();
  };

  if (!isClient) return null;

  const state = isOpen ? "open" : "closed";

  return createPortal(
    <>
      <div className="drawer-backdrop fixed inset-0 z-[60] bg-black/40" data-state={state} onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search recipes"
        aria-hidden={!isOpen}
        inert={!isOpen}
        data-state={state}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        className="overlay-panel fixed left-1/2 top-[8vh] z-[70] w-[92vw] max-w-xl rounded-[var(--radius-lg)] bg-[var(--color-elevated)] border border-[var(--color-border)] p-4 sm:p-5"
      >
        <form
          onSubmit={submit}
          role="search"
          className="flex items-center gap-3 border-b-2 border-[var(--color-border)] focus-within:border-[var(--color-primary)] transition-colors pb-1"
        >
          <svg className="w-5 h-5 shrink-0 text-[var(--color-text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
          </svg>
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search recipes…"
            aria-label="Search recipes"
            className="field-bare flex-1 h-11 text-base"
          />
          <button
            type="submit"
            className="h-9 px-4 rounded-full bg-[var(--color-primary)] text-[var(--color-on-primary)] text-sm font-medium hover:bg-[var(--color-primary-hover)] transition-colors"
          >
            Search
          </button>
        </form>

        <div className="mt-4">
          <p className="eyebrow mb-2">What to eat?</p>
          <div className="flex flex-wrap gap-2">
            {WHAT_TO_EAT.map((item) => (
              <Link
                key={item.key}
                href={`/recipes?${item.param}=${item.value}`}
                onClick={onClose}
                tabIndex={isOpen ? 0 : -1}
                className="h-8 px-3 rounded-full text-sm border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors inline-flex items-center"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
