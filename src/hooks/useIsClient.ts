"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};

/** true after hydration, false during SSR and the first client render. No effects, no state. */
export function useIsClient(): boolean {
  return useSyncExternalStore(noop, () => true, () => false);
}
