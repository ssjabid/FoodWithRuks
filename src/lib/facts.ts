import type { Recipe } from "@/types";

/**
 * Every meta string on the site is a plain sentence built here:
 * "Makes 12 cookies. About 40 minutes, plus overnight chilling." No middle dots anywhere.
 * Dependency-free so node:test can import it directly.
 */

const plurals = new Intl.PluralRules("en-GB");

export function plural(n: number, one: string, other: string): string {
  return plurals.select(n) === "one" ? one : other;
}

/** Round a duration to what a person would say. Empty for 0. */
export function formatMinutes(minutes: number): string {
  const m = Math.max(0, Math.round(minutes));
  if (m === 0) return "";
  if (m < 60) return `About ${m} ${plural(m, "minute", "minutes")}`;
  const h = Math.floor(m / 60);
  const rest = m % 60;
  if (rest === 0) return h === 1 ? "About an hour" : `About ${h} hours`;
  // round the remainder to the nearest 5 for a spoken feel
  const r5 = Math.round(rest / 5) * 5;
  if (r5 === 0) return h === 1 ? "About an hour" : `About ${h} hours`;
  if (r5 === 60) return h + 1 === 1 ? "About an hour" : `About ${h + 1} hours`;
  if (r5 === 30) return h === 1 ? "About an hour and a half" : `About ${h} and a half hours`;
  return h === 1 ? `About 1 hour ${r5}` : `About ${h} hours ${r5}`;
}

export interface ExtraTimeLike {
  minutes: number;
  /** "chilling", "proving", "setting", "resting" */
  label: string;
}

/** "plus 4 hours chilling", "plus 30 minutes resting", "plus overnight chilling" (8 hours or more). */
export function formatExtraTime(extra: ExtraTimeLike | null | undefined): string {
  if (!extra || !extra.minutes || extra.minutes <= 0) return "";
  const label = extra.label.trim() || "resting";
  const m = Math.round(extra.minutes);
  if (m >= 480) return `plus overnight ${label}`;
  if (m < 60) return `plus ${m} ${plural(m, "minute", "minutes")} ${label}`;
  const h = Math.floor(m / 60);
  const rest = m % 60;
  if (rest === 0) return h === 1 ? `plus an hour ${label}` : `plus ${h} hours ${label}`;
  if (rest === 30) return h === 1 ? `plus an hour and a half ${label}` : `plus ${h} and a half hours ${label}`;
  return `plus ${h} ${plural(h, "hour", "hours")} ${rest} ${label}`;
}

type YieldFields = Pick<Recipe, "yieldKind" | "yieldNoun" | "servings">;
type TimeFields = Pick<Recipe, "prepTime" | "cookTime"> & { extraTime?: ExtraTimeLike | null };

/** "Serves 4", "Makes 12 cookies", "Makes 1 cake", scaled by an optional multiplier. */
export function yieldText(recipe: YieldFields, multiplier = 1): string {
  const n = scaledServings(recipe.servings, multiplier);
  if (recipe.yieldKind === "makes") {
    const noun = recipe.yieldNoun;
    if (noun && noun.one && noun.other) return `Makes ${formatCount(n)} ${plural(n, noun.one, noun.other)}`;
    return `Makes ${formatCount(n)}`;
  }
  return `Serves ${formatCount(n)}`;
}

export function scaledServings(servings: number, multiplier: number): number {
  const n = servings * multiplier;
  return Math.round(n * 2) / 2; // keep halves for a half batch
}

function formatCount(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1).replace(".0", "").replace(".5", "½");
}

/** "About 40 minutes" or "About an hour, plus 4 hours chilling" (empty when there is no time at all). */
export function timeText(recipe: TimeFields): string {
  const active = formatMinutes(recipe.prepTime + recipe.cookTime);
  const extra = formatExtraTime(recipe.extraTime);
  if (active && extra) return `${active}, ${extra}`;
  if (active) return active;
  if (extra) return extra.replace(/^plus /, "About ").replace("overnight", "overnight of");
  return "";
}

/** The whole facts line: "Makes 12 cookies. About 40 minutes." */
export function factsLine(recipe: YieldFields & TimeFields): string {
  const parts = [yieldText(recipe)];
  const time = timeText(recipe);
  if (time) parts.push(time);
  return parts.map((p) => `${p}.`).join(" ");
}

/** JSON-LD recipeYield: "12 cookies", "4 servings", "1 serving" */
export function jsonLdYield(recipe: YieldFields): string {
  const n = recipe.servings;
  if (recipe.yieldKind === "makes") {
    const noun = recipe.yieldNoun;
    if (noun && noun.one && noun.other) return `${n} ${plural(n, noun.one, noun.other)}`;
    return String(n);
  }
  return `${n} ${plural(n, "serving", "servings")}`;
}

/** Prep + cook + extra, for JSON-LD totalTime. */
export function totalMinutes(recipe: TimeFields): number {
  return Math.max(0, Math.round(recipe.prepTime)) + Math.max(0, Math.round(recipe.cookTime)) + Math.max(0, Math.round(recipe.extraTime?.minutes ?? 0));
}

/** ISO 8601 duration: 90 -> "PT1H30M", 0 -> "PT0M" */
export function isoDuration(minutes: number): string {
  const m = Math.max(0, Math.round(minutes));
  const h = Math.floor(m / 60);
  const rest = m % 60;
  if (h && rest) return `PT${h}H${rest}M`;
  if (h) return `PT${h}H`;
  return `PT${rest}M`;
}

/** "26 September 2026" */
export function formatDateLong(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(date);
}

/** "September" (for "Updated September" on the Currently card) */
export function formatMonth(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", { month: "long" }).format(date);
}
