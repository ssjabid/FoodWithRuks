"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_TREE } from "@/lib/constants";
import { SOCIAL_LINKS, TAGLINE_SECONDARY } from "@/lib/site";
import { Logo } from "@/components/ui/Logo";
import { Chevron } from "@/components/ui/Chevron";
import { InstagramIcon } from "@/components/shared/InstagramIcon";
import { ThemePicker } from "@/components/shared/ThemePicker";
import { useTheme } from "@/components/shared/ThemeProvider";
import { useIsClient } from "@/hooks/useIsClient";

interface NavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  /** Element to return focus to when the drawer closes (usually the hamburger). */
  returnFocusRef?: React.RefObject<HTMLElement | null>;
}

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function NavDrawer({ isOpen, onClose, returnFocusRef }: NavDrawerProps) {
  const pathname = usePathname();
  const isClient = useIsClient();
  const { showPicker } = useTheme();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Which groups are expanded; the group for the current section opens by default.
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  // Body scroll lock + initial focus while open
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

  // Close when the route changes (query-only changes are handled by the link onClick)
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
    const nodes = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      (el) => el.offsetParent !== null
    );
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

  const isGroupOpen = (href: string) => openGroups[href] ?? pathname.startsWith(href);

  if (!isClient) return null;

  const state = isOpen ? "open" : "closed";

  return createPortal(
    <>
      <div
        className="drawer-backdrop fixed inset-0 z-50 bg-black/40"
        data-state={state}
        onClick={handleClose}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        id="site-nav"
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
        aria-hidden={!isOpen}
        inert={!isOpen}
        data-state={state}
        onKeyDown={onKeyDown}
        className="drawer-panel fixed inset-y-0 left-0 z-50 flex h-full w-[86vw] max-w-sm flex-col bg-[var(--color-background)] border-r border-[var(--color-border)]"
      >
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 h-14">
          <Logo size="sm" />
          <button
            ref={closeBtnRef}
            type="button"
            onClick={handleClose}
            className="w-10 h-10 -mr-2 rounded-full flex items-center justify-center hover:bg-[var(--color-secondary)] transition-colors"
            aria-label="Close menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-0.5">
            {NAV_TREE.map((node, i) => {
              const isActive = pathname === node.href || (!!node.children && pathname.startsWith(node.href));
              const expanded = !!node.children && isGroupOpen(node.href);
              const groupId = `nav-group-${i}`;
              return (
                <li key={node.href}>
                  <div className="flex items-center">
                    <Link
                      href={node.href}
                      onClick={onClose}
                      aria-current={pathname === node.href ? "page" : undefined}
                      className={cn(
                        "flex-1 px-3 py-2.5 rounded-[var(--radius-sm)] font-heading text-[var(--text-nav)] transition-colors",
                        isActive
                          ? "text-[var(--color-primary)] font-medium"
                          : "text-[var(--color-text-primary)] hover:bg-[var(--color-secondary)]"
                      )}
                    >
                      {node.label}
                    </Link>
                    {node.children && (
                      <button
                        type="button"
                        aria-expanded={expanded}
                        aria-controls={groupId}
                        aria-label={`${expanded ? "Collapse" : "Expand"} ${node.label}`}
                        onClick={() => setOpenGroups((g) => ({ ...g, [node.href]: !expanded }))}
                        className="w-10 h-10 rounded-full flex items-center justify-center text-[var(--color-text-secondary)] hover:bg-[var(--color-secondary)] transition-colors"
                      >
                        <Chevron open={expanded} className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {node.children && (
                    <div id={groupId} className="accordion" data-open={expanded}>
                      <ul className="pl-3 pb-1">
                        {node.children.map((child) => (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              onClick={onClose}
                              tabIndex={expanded ? 0 : -1}
                              className="block px-3 py-2 rounded-[var(--radius-sm)] text-[15px] text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-secondary)] transition-colors"
                            >
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {showPicker && <ThemePicker />}

        <div className="border-t border-[var(--color-border)] px-5 py-4 flex items-center justify-between gap-3">
          <p className="accent-italic text-sm">{TAGLINE_SECONDARY}</p>
          <a
            href={SOCIAL_LINKS.instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-secondary)] transition-colors"
            aria-label={`${SOCIAL_LINKS.instagram.label} ${SOCIAL_LINKS.instagram.handle}`}
          >
            <InstagramIcon className="w-5 h-5" />
          </a>
        </div>
      </div>
    </>,
    document.body
  );
}
