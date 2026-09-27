"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/constants";
import { Wordmark } from "@/components/brand/Wordmark";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { MenuSheet } from "./NavDrawer";
import { SearchOverlay } from "./SearchOverlay";

interface HeaderProps {
  /** Cooking is hidden until a cooking recipe is published */
  showCooking: boolean;
}

export function Header({ showCooking }: HeaderProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const menuBtnRef = useRef<HTMLButtonElement>(null);

  // Ctrl/Cmd + K opens search from anywhere (no hint shown; it just works)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);
  const items = NAV_ITEMS.filter((item) => item.hideWhenEmpty !== "cooking" || showCooking);
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  const iconBtn =
    "w-11 h-11 rounded-full flex items-center justify-center text-[var(--color-text)] hover:bg-[var(--color-surface)] transition-colors";

  return (
    <header className="sticky top-0 z-40 bg-[var(--color-ground)] border-b border-[var(--color-line)]">
      <div className="max-w-wide mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-[auto_1fr_auto] items-center h-16 gap-4">
          <Wordmark size="md" />

          <nav aria-label="Main" className="hidden md:flex justify-center gap-7">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={cn(
                  "py-1.5 text-[var(--text-nav)] border-b-2 transition-colors",
                  isActive(item.href)
                    ? "border-[var(--color-cheek)] text-[var(--color-text)]"
                    : "border-transparent text-[var(--color-text-2)] hover:text-[var(--color-text)]"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center justify-end gap-0.5">
            <button type="button" onClick={() => setSearchOpen(true)} aria-label="Search recipes" className={iconBtn}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7} aria-hidden="true">
                <circle cx="11" cy="11" r="6" />
                <path strokeLinecap="round" d="m20 20-4.3-4.3" />
              </svg>
            </button>
            <ThemeToggle />
            <button
              ref={menuBtnRef}
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-controls="site-menu"
              aria-expanded={menuOpen}
              className={cn(iconBtn, "md:hidden")}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7} aria-hidden="true">
                <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h10" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <MenuSheet isOpen={menuOpen} onClose={closeMenu} returnFocusRef={menuBtnRef} showCooking={showCooking} />
      <SearchOverlay isOpen={searchOpen} onClose={closeSearch} showCooking={showCooking} />
    </header>
  );
}
