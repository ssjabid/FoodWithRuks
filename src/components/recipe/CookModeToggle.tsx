"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";
import { COPY } from "@/lib/copy";

type WakeLockSentinelLike = { release: () => Promise<void>; addEventListener?: (type: "release", cb: () => void) => void };
type NavigatorWithWakeLock = Navigator & { wakeLock?: { request: (type: "screen") => Promise<WakeLockSentinelLike> } };

const supported = () => typeof navigator !== "undefined" && "wakeLock" in navigator;

/** "Keep the screen on": Screen Wake Lock, feature-detected, re-acquired when the tab comes back, released on leave. */
export function CookModeToggle({ className }: { className?: string }) {
  const isSupported = useSyncExternalStore(
    () => () => {},
    supported,
    () => false
  );
  const [on, setOn] = useState(false);
  const sentinel = useRef<WakeLockSentinelLike | null>(null);

  useEffect(() => {
    if (!on) return;
    let cancelled = false;
    const acquire = async () => {
      try {
        const lock = await (navigator as NavigatorWithWakeLock).wakeLock?.request("screen");
        if (!lock || cancelled) {
          await lock?.release();
          return;
        }
        sentinel.current = lock;
      } catch {
        setOn(false);
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible" && sentinel.current === null) void acquire();
    };
    void acquire();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibility);
      void sentinel.current?.release();
      sentinel.current = null;
    };
  }, [on]);

  if (!isSupported) return null;

  return (
    <button
      type="button"
      onClick={() => setOn((v) => !v)}
      aria-pressed={on}
      className={cn(
        "no-print inline-flex items-center gap-2 h-11 px-4 rounded-full border-[1.5px] text-sm font-medium transition-colors",
        on ? "border-[var(--color-cheek)] bg-[var(--color-blush)] text-[var(--color-on-blush)]" : "border-[var(--color-line-strong)] text-[var(--color-text-2)] hover:border-[var(--color-cheek)]",
        className
      )}
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} aria-hidden="true">
        <rect x="6" y="3" width="12" height="18" rx="2" />
        <path strokeLinecap="round" d="M11 17h2" />
      </svg>
      {COPY.keepScreenOn}
      {on ? ": on" : ""}
    </button>
  );
}
