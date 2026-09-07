"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { NAV_TREE } from "@/lib/constants";
import { SOCIAL_LINKS, TAGLINE_SECONDARY } from "@/lib/site";
import { Logo } from "@/components/ui/Logo";
import { InstagramIcon } from "@/components/shared/InstagramIcon";

interface NavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  /** Element to return focus to when the drawer closes (usually the hamburger). */
  returnFocusRef?: React.RefObject<HTMLElement | null>;
}

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function NavDrawer({ isOpen, onClose, returnFocusRef }: NavDrawerProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Groups auto-open for the section you are currently in.
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  useEffect(() => setMounted(true), []);

  // Body scroll lock
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  // Sync open groups + initial focus when opening
  useEffect(() => {
    if (!isOpen) return;
    setOpenGroups(
      Object.fromEntries(
        NAV_TREE.filter((n) => n.children).map((n) => [n.href, pathname.startsWith(n.href)])
      )
    );
    const t = window.setTimeout(() => closeBtnRef.current?.focus(), 50);
    return () => window.clearTimeout(t);
  }, [isOpen, pathname]);

  // Close on route change
  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleClose}
            aria-hidden="true"
          />

          <motion.div
            ref={panelRef}
            id="site-nav"
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
            onKeyDown={onKeyDown}
            className="fixed inset-y-0 left-0 z-50 flex h-full w-[85vw] max-w-sm flex-col bg-[var(--color-background)] shadow-[var(--shadow-lg)]"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
          >
            <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 h-14 sm:h-16">
              <Logo size="sm" />
              <button
                ref={closeBtnRef}
                onClick={handleClose}
                className="w-10 h-10 -mr-2 rounded-full flex items-center justify-center hover:bg-[var(--color-secondary)] transition-colors"
                aria-label="Close menu"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-4">
              <ul className="space-y-1">
                {NAV_TREE.map((node, i) => {
                  const isActive = pathname === node.href || (node.children && pathname.startsWith(node.href));
                  const expanded = !!openGroups[node.href];
                  const groupId = `nav-group-${i}`;
                  return (
                    <motion.li
                      key={node.href}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 + i * 0.05, type: "spring", stiffness: 300, damping: 26 }}
                    >
                      <div className="flex items-center">
                        <Link
                          href={node.href}
                          onClick={onClose}
                          className={cn(
                            "flex-1 px-3 py-3 rounded-[var(--radius-sm)] font-heading text-lg transition-colors duration-200",
                            isActive
                              ? "text-[var(--color-primary)] font-semibold"
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
                            <motion.svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                              animate={{ rotate: expanded ? 180 : 0 }}
                              transition={{ duration: 0.2 }}
                              aria-hidden="true"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </motion.svg>
                          </button>
                        )}
                      </div>

                      {node.children && (
                        <AnimatePresence initial={false}>
                          {expanded && (
                            <motion.ul
                              id={groupId}
                              className="overflow-hidden pl-3"
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.22, ease: "easeInOut" }}
                            >
                              {node.children.map((child) => (
                                <li key={child.href}>
                                  <Link
                                    href={child.href}
                                    onClick={onClose}
                                    className="block px-3 py-2 rounded-[var(--radius-sm)] text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-secondary)] transition-colors"
                                  >
                                    {child.label}
                                  </Link>
                                </li>
                              ))}
                            </motion.ul>
                          )}
                        </AnimatePresence>
                      )}
                    </motion.li>
                  );
                })}
              </ul>
            </nav>

            <div className="border-t border-[var(--color-border)] px-5 py-4 flex items-center justify-between gap-3">
              <p className="font-heading italic text-sm text-[var(--color-text-secondary)]">{TAGLINE_SECONDARY}</p>
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
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}

