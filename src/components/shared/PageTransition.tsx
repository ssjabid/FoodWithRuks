"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Calm page transitions without a library or experimental flags.
 *
 * - `PageEnter` wraps the page content in the root layout. When the pathname
 *   changes it replays a short fade-and-settle on the new page (not on first
 *   load, so LCP is untouched; not inside /admin, which has its own chrome).
 * - `PageTransitionListener` watches for clicks on internal links that lead to
 *   a different page and marks <html data-navigating> so the outgoing page
 *   softens while the next one loads. `PageEnter` clears the flag as soon as
 *   the new page commits; a safety timer clears it if navigation is cancelled.
 * - `prefers-reduced-motion` disables both (see globals.css).
 */

const ATTR = "data-navigating";
const SAFETY_MS = 1500;
let safetyTimer: number | undefined;

function isAdminPath(pathname: string) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

/** Mark a cross-page navigation as pending. No-op for same-page (hash / query) changes. */
export function beginPageTransition(href: string) {
  if (typeof document === "undefined") return;
  let url: URL;
  try {
    url = new URL(href, window.location.href);
  } catch {
    return;
  }
  if (url.origin !== window.location.origin) return;
  if (url.pathname === window.location.pathname) return;
  if (isAdminPath(url.pathname) || isAdminPath(window.location.pathname)) return;
  document.documentElement.setAttribute(ATTR, "");
  window.clearTimeout(safetyTimer);
  safetyTimer = window.setTimeout(endPageTransition, SAFETY_MS);
}

export function endPageTransition() {
  if (typeof document === "undefined") return;
  window.clearTimeout(safetyTimer);
  document.documentElement.removeAttribute(ATTR);
}

/** Installed once in the root layout. Listens in the capture phase so it never interferes with <Link>. */
export function PageTransitionListener() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const target = e.target as Element | null;
      const anchor = target?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;
      if (anchor.dataset.noTransition !== undefined) return;
      beginPageTransition(anchor.href);
    };
    const onPageShow = () => endPageTransition();
    document.addEventListener("click", onClick, true);
    window.addEventListener("pageshow", onPageShow);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, []);
  return null;
}

/** Wraps page content; replays the enter animation whenever the pathname changes. */
export function PageEnter({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);
  const firstRun = useRef(true);

  // Layout effect: runs after the new page is in the DOM but before it paints,
  // so the first frame of the new page is already at opacity 0.
  useLayoutEffect(() => {
    endPageTransition();
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    const el = ref.current;
    if (!el || isAdminPath(pathname)) return;
    el.classList.remove("page-enter");
    void el.offsetWidth; // restart the animation
    el.classList.add("page-enter");
  }, [pathname]);

  return <div ref={ref}>{children}</div>;
}
