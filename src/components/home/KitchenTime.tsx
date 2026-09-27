"use client";

import { useSyncExternalStore } from "react";
import { kitchenLine, type KitchenSlot } from "@/lib/kitchenTime";
import { EASTER_EGGS } from "@/lib/site";
import { Mark } from "@/components/brand/Mark";

/*
 * The kitchen-time line: computed on the client in Europe/London because the
 * page is cached for an hour. Height is reserved so nothing shifts when it appears.
 */

const listeners = new Set<() => void>();
let current: { slot: KitchenSlot; line: string } | null = null;
let timer: number | undefined;

function tick() {
  const next = kitchenLine(new Date());
  if (!current || current.slot !== next.slot) {
    current = next;
    listeners.forEach((l) => l());
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!current) tick();
  if (timer === undefined) timer = window.setInterval(tick, 60_000);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && timer !== undefined) {
      window.clearInterval(timer);
      timer = undefined;
    }
  };
}

const getSnapshot = () => current;
const getServerSnapshot = () => null;

export function KitchenTime() {
  const now = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const sleepy = now?.slot === "late" && EASTER_EGGS.sleepyLateLine;

  return (
    <p className="flex items-center gap-2 min-h-6 mt-6 mb-3 text-[15px] text-[var(--color-text-2)]" data-slot={now?.slot ?? ""} aria-live="off">
      {sleepy && <Mark state="asleep" size={18} />}
      {/* DRAFT: needs Ruks (src/lib/kitchenTime.ts) */}
      <span className={now ? "fade-in" : "invisible"}>{now?.line ?? " "}</span>
    </p>
  );
}
