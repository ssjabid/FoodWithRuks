/**
 * The kitchen-time line on the home page, computed on the client in Europe/London
 * (the page is cached, so the server cannot know the time).
 * Dependency-free so node:test can import it directly.
 */

export type KitchenSlot = "morning" | "afternoon" | "evening" | "late";

// DRAFT: needs Ruks
export const KITCHEN_LINES: Record<KitchenSlot, string> = {
  morning: "Morning. The oven's already on.",
  afternoon: "Afternoon. Kettle's on.",
  evening: "Evening. Room for something sweet?",
  late: "Late. Ruks has probably nodded off. The recipes are open.",
};

export function londonHour(date: Date = new Date()): number {
  const parts = new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone: "Europe/London" }).formatToParts(date);
  const h = Number(parts.find((p) => p.type === "hour")?.value ?? "12");
  return h === 24 ? 0 : h;
}

export function kitchenSlot(date: Date = new Date()): KitchenSlot {
  const h = londonHour(date);
  if (h >= 5 && h < 12) return "morning";
  if (h >= 12 && h < 17) return "afternoon";
  if (h >= 17 && h < 22) return "evening";
  return "late";
}

export function kitchenLine(date: Date = new Date()): { slot: KitchenSlot; line: string } {
  const slot = kitchenSlot(date);
  return { slot, line: KITCHEN_LINES[slot] };
}
