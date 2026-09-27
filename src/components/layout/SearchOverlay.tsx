"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { buildSearchHref } from "@/lib/search";
import { useIsClient } from "@/hooks/useIsClient";
import { beginPageTransition } from "@/components/shared/PageTransition";

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  showCooking: boolean;
}

export function SearchOverlay({ isOpen, onClose, showCooking }: SearchOverlayProps) {
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
    const href = buildSearchHref(query);
    beginPageTransition(href);
    router.push(href);
    setQuery("");
    onClose();
  };

  if (!isClient) return null;

  const state = isOpen ? "open" : "closed";
  const links = [
    { label: "All the bakes", href: "/bakes" },
    ...(showCooking ? [{ label: "Cooking", href: "/cooking" }] : []),
    { label: "Stories", href: "/lifestyle" },
  ];

  return createPortal(
    <>
      <div className="drawer-backdrop fixed inset-0 z-[60] bg-black/30" data-state={state} onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search recipes"
        aria-hidden={!isOpen}
        inert={!isOpen}
        data-state={state}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        className="overlay-panel fixed left-1/2 top-[8vh] z-[70] w-[92vw] max-w-xl rounded-[var(--radius-lg)] bg-[var(--color-elevated)] border border-[var(--color-line-strong)] p-4 sm:p-5"
      >
        <form
          onSubmit={submit}
          role="search"
          className="flex items-center gap-3 border-b-2 border-[var(--color-line-strong)] focus-within:border-[var(--color-cheek)] transition-colors pb-1"
        >
          <svg className="w-5 h-5 shrink-0 text-[var(--color-text-3)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7} aria-hidden="true">
            <circle cx="11" cy="11" r="6" />
            <path strokeLinecap="round" d="m20 20-4.3-4.3" />
          </svg>
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What are you after?"
            aria-label="Search recipes"
            className="field-bare flex-1 h-11 text-base"
          />
          <button
            type="submit"
            className="h-10 px-4 rounded-full bg-[var(--color-cheek)] text-[var(--color-on-cheek)] text-sm font-medium hover:bg-[var(--color-cheek-hover)] transition-colors"
          >
            Search
          </button>
        </form>

        <div className="mt-4 flex flex-wrap gap-2">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              tabIndex={isOpen ? 0 : -1}
              className="h-10 px-4 rounded-full text-sm border border-[var(--color-line-strong)] text-[var(--color-text-2)] hover:border-[var(--color-cheek)] hover:text-[var(--color-cheek)] transition-colors inline-flex items-center"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </>,
    document.body
  );
}
