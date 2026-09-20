"use client";

import { useEffect } from "react";

/** Counts one view per browser session for a recipe. Renders nothing. */
export function ViewPing({ slug }: { slug: string }) {
  useEffect(() => {
    const key = `ar_viewed:${slug}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      /* storage unavailable: still count once for this page load */
    }
    const body = JSON.stringify({ slug });
    const sent =
      typeof navigator.sendBeacon === "function" &&
      navigator.sendBeacon("/api/recipes/view", new Blob([body], { type: "application/json" }));
    if (!sent) {
      fetch("/api/recipes/view", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(
        () => {}
      );
    }
  }, [slug]);
  return null;
}
