"use client";

import { useEffect, useState } from "react";

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      data-state={visible ? "open" : "closed"}
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
      aria-label="Back to top"
      className="back-to-top fixed bottom-6 right-6 z-40 w-10 h-10 rounded-full bg-[var(--color-primary)] text-[var(--color-on-primary)] flex items-center justify-center hover:bg-[var(--color-primary-hover)] transition-[opacity,visibility,background-color] duration-150 opacity-0 invisible data-[state=open]:opacity-100 data-[state=open]:visible"
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 15l7-7 7 7" />
      </svg>
    </button>
  );
}
