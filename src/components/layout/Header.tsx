"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Logo } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { NavDrawer } from "./NavDrawer";
import { SearchOverlay } from "./SearchOverlay";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Ctrl/Cmd + K opens search from anywhere
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

  return (
    <motion.header
      className="sticky top-0 z-40 border-b"
      animate={{
        backgroundColor: scrolled
          ? "color-mix(in srgb, var(--color-background) 82%, transparent)"
          : "var(--color-background)",
        backdropFilter: scrolled ? "blur(20px)" : "blur(0px)",
        borderBottomColor: scrolled ? "var(--color-border)" : "transparent",
        boxShadow: scrolled ? "var(--shadow-sm)" : "0 0 0 rgba(0,0,0,0)",
      }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center h-14 sm:h-16">
          {/* Left — hamburger (all breakpoints) */}
          <div className="flex items-center">
            <button
              ref={menuBtnRef}
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-controls="site-nav"
              aria-expanded={menuOpen}
              className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-[var(--color-text-primary)] hover:bg-[var(--color-secondary)] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 7h16M4 12h16M4 17h10" />
              </svg>
            </button>
          </div>

          {/* Centre — wordmark */}
          <div className="flex justify-center">
            <Logo />
          </div>

          {/* Right — search + theme */}
          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search recipes"
              className="w-10 h-10 rounded-full flex items-center justify-center text-[var(--color-text-primary)] hover:bg-[var(--color-secondary)] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
              </svg>
            </button>
            <ThemeToggle />
          </div>
        </div>
      </div>

      <NavDrawer isOpen={menuOpen} onClose={closeMenu} returnFocusRef={menuBtnRef} />
      <SearchOverlay isOpen={searchOpen} onClose={closeSearch} />
    </motion.header>
  );
}
