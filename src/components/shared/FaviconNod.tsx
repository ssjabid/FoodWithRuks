"use client";

import { useEffect } from "react";
import { EASTER_EGGS } from "@/lib/site";

/** The favicon nods off while the tab is hidden and wakes up when you come back. The title never changes. */
export function FaviconNod() {
  useEffect(() => {
    if (!EASTER_EGGS.faviconNodsOff) return;
    const links = Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel~="icon"]'));
    if (links.length === 0) return;
    const originals = links.map((l) => l.getAttribute("href") || "");
    const onChange = () => {
      links.forEach((l, i) => l.setAttribute("href", document.hidden ? "/icon-asleep.svg" : originals[i]));
    };
    document.addEventListener("visibilitychange", onChange);
    return () => {
      document.removeEventListener("visibilitychange", onChange);
      links.forEach((l, i) => l.setAttribute("href", originals[i]));
    };
  }, []);
  return null;
}
