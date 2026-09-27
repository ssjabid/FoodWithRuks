"use client";

import { useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/constants";
import { SOCIAL_LINKS, SITE_BYLINE } from "@/lib/site";
import { Wordmark } from "@/components/brand/Wordmark";
import { Note } from "@/components/brand/Note";
import { InstagramIcon } from "@/components/shared/InstagramIcon";
import { useIsClient } from "@/hooks/useIsClient";

interface MenuSheetProps {
  isOpen: boolean;
  onClose: () => void;
  returnFocusRef?: React.RefObject<HTMLElement | null>;
  showCooking: boolean;
}

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** The phone menu: a simple sheet under the header with four sections and two extras. Always mounted, inert when closed. */
export function MenuSheet({ isOpen, onClose, returnFocusRef, showCooking }: MenuSheetProps) {
  const pathname = usePathname();
  const isClient = useIsClient();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => closeBtnRef.current?.focus(), 30);
    return () => {
      document.body.style.overflow = prev;
      window.clearTimeout(t);
    };
  }, [isOpen]);

  // Close when the route changes
  const lastPath = useRef(pathname);
  useEffect(() => {
    if (lastPath.current !== pathname) {
      lastPath.current = pathname;
      onCloseRef.current();
    }
  }, [pathname]);

  const handleClose = useCallback(() => {
    onClose();
    returnFocusRef?.current?.focus();
  }, [onClose, returnFocusRef]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      handleClose();
      return;
    }
    if (e.key !== "Tab" || !panelRef.current) return;
    const nodes = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null);
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

  if (!isClient) return null;

  const state = isOpen ? "open" : "closed";
  const items = [
    ...NAV_ITEMS.filter((item) => item.hideWhenEmpty !== "cooking" || showCooking),
    { label: "Say hello", href: "/contact" },
    { label: "New bakes by email", href: "/newsletter" },
  ];

  return createPortal(
    <>
      <div className="drawer-backdrop fixed inset-0 z-50 bg-black/30" data-state={state} onClick={handleClose} aria-hidden="true" />
      <div
        ref={panelRef}
        id="site-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        aria-hidden={!isOpen}
        inert={!isOpen}
        data-state={state}
        onKeyDown={onKeyDown}
        className="drawer-panel fixed inset-x-0 top-0 z-50 max-h-dvh overflow-y-auto overscroll-contain bg-[var(--color-ground)] border-b border-[var(--color-line)] rounded-b-[var(--radius-lg)]"
      >
        <div className="max-w-wide mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <Wordmark size="md" asText />
            <button
              ref={closeBtnRef}
              type="button"
              onClick={handleClose}
              className="w-11 h-11 -mr-2 rounded-full flex items-center justify-center hover:bg-[var(--color-surface)] transition-colors"
              aria-label="Close menu"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav aria-label="Menu" className="py-2">
            <ul>
              {items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center h-12 px-2 rounded-[var(--radius-sm)] font-heading text-[1.35rem] transition-colors",
                        active ? "text-[var(--color-cheek)]" : "text-[var(--color-text)] hover:bg-[var(--color-surface)]"
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center justify-between gap-4 py-4 border-t border-[var(--color-line)]">
            <Note as="span" size="sm">
              {SITE_BYLINE}
            </Note>
            <a
              href={SOCIAL_LINKS.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className="w-11 h-11 shrink-0 rounded-full flex items-center justify-center text-[var(--color-text-2)] hover:text-[var(--color-cheek)] hover:bg-[var(--color-surface)] transition-colors"
              aria-label={`${SOCIAL_LINKS.instagram.label} ${SOCIAL_LINKS.instagram.handle}`}
            >
              <InstagramIcon className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
