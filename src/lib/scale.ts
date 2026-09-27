/**
 * Ingredient scaling with real fraction glyphs and rounding a baker would do:
 * grams and millilitres to whole numbers (to the nearest 5 above 100),
 * spoons and cups to the nearest quarter, eggs to the nearest half.
 * Metric first; nothing is ever converted between systems.
 * Dependency-free so node:test can import it directly.
 */

const FRACTIONS: ReadonlyArray<readonly [number, string]> = [
  [0.25, "¼"],
  [0.333, "⅓"],
  [0.5, "½"],
  [0.667, "⅔"],
  [0.75, "¾"],
];

const GLYPH_VALUES: Record<string, number> = {
  "¼": 0.25,
  "⅓": 1 / 3,
  "½": 0.5,
  "⅔": 2 / 3,
  "¾": 0.75,
  "⅛": 0.125,
};

/** Parses "2", "1.5", "1/2", "1 1/2", "1½", "½", "2-3" (a range: returns null so it is left alone). */
export function parseAmount(raw: string): number | null {
  const s = raw.trim().replace(/,/g, ".");
  if (!s) return null;
  if (/[-–]/.test(s.replace(/^-/, ""))) return null; // ranges stay as written
  // mixed with a glyph: "1½"
  const glyph = s.match(/^(\d+)?\s*([¼⅓½⅔¾⅛])$/);
  if (glyph) return (glyph[1] ? Number(glyph[1]) : 0) + GLYPH_VALUES[glyph[2]];
  // "1 1/2" or "1/2"
  const frac = s.match(/^(\d+)?\s*(\d+)\/(\d+)$/);
  if (frac) {
    const whole = frac[1] ? Number(frac[1]) : 0;
    const den = Number(frac[3]);
    if (den === 0) return null;
    return whole + Number(frac[2]) / den;
  }
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export type Rounding = "whole" | "quarter" | "half" | "decimal";

const SPOON_UNITS = new Set(["tsp", "tbsp", "cup", "cups", "teaspoon", "teaspoons", "tablespoon", "tablespoons"]);
const WEIGHT_UNITS = new Set(["g", "ml", "gram", "grams", "millilitre", "millilitres", "milliliter", "milliliters"]);

/** Picks the rounding rule from the unit and ingredient name. */
export function roundingFor(unit: string, name: string): Rounding {
  const u = unit.trim().toLowerCase();
  if (WEIGHT_UNITS.has(u)) return "whole";
  if (SPOON_UNITS.has(u)) return "quarter";
  if (/\begg(s)?\b/i.test(name) && (u === "" || u === "whole" || u === "large" || u === "medium")) return "half";
  return "decimal";
}

export function roundAmount(value: number, rule: Rounding): number {
  switch (rule) {
    case "whole":
      return Math.round(value); // whole grams, always: baking wants 113 g, not 115 g
    case "quarter":
      return Math.round(value * 4) / 4;
    case "half":
      return Math.round(value * 2) / 2;
    default:
      return Math.round(value * 10) / 10;
  }
}

/** 1.5 -> "1½", 0.25 -> "¼", 2 -> "2", 0.3 -> "0.3" */
export function formatAmount(value: number): string {
  if (value <= 0) return "0";
  const whole = Math.floor(value);
  const rest = value - whole;
  if (rest < 0.01) return String(whole);
  const glyph = FRACTIONS.find(([v]) => Math.abs(v - rest) < 0.02);
  if (glyph) return whole > 0 ? `${whole}${glyph[1]}` : glyph[1];
  return String(Math.round(value * 10) / 10);
}

export interface ScaledAmount {
  text: string;
  /** e.g. "(beaten, use half)" for 1½ eggs */
  note?: string;
}

/** Scales one ingredient amount string. Unparseable amounts are returned unchanged. */
export function scaleAmount(raw: string, factor: number, unit = "", name = ""): ScaledAmount {
  if (factor === 1) return { text: raw.trim() };
  const parsed = parseAmount(raw);
  if (parsed === null) return { text: raw.trim() };
  const rule = roundingFor(unit, name);
  let value = roundAmount(parsed * factor, rule);
  if (value === 0 && parsed > 0) value = rule === "whole" ? 1 : rule === "quarter" ? 0.25 : rule === "half" ? 0.5 : 0.1;
  const text = formatAmount(value);
  if (rule === "half" && !Number.isInteger(value)) return { text, note: "(beaten, use half)" };
  return { text };
}

/** Scaling options for a "makes" recipe */
export const BATCH_OPTIONS: ReadonlyArray<{ value: number; label: string }> = [
  { value: 0.5, label: "½×" },
  { value: 1, label: "1×" },
  { value: 2, label: "2×" },
  { value: 3, label: "3×" },
];
