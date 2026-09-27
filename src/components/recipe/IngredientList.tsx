"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { formatAmount, parseAmount, scaleAmount } from "@/lib/scale";
import type { Ingredient } from "@/types";

interface IngredientListProps {
  ingredients: Ingredient[];
  /** 1 = as written; 0.5 / 2 / 3 for a makes recipe, servings ratio for a serves recipe */
  factor: number;
}

/** Amounts with real fraction glyphs, scaled by the factor; tickable so you can keep your place with floury hands. */
export function displayAmount(raw: string, factor: number, unit: string, name: string): { text: string; note?: string } {
  if (factor === 1) {
    const parsed = parseAmount(raw);
    return { text: parsed === null ? raw.trim() : formatAmount(parsed) };
  }
  return scaleAmount(raw, factor, unit, name);
}

export function IngredientList({ ingredients, factor }: IngredientListProps) {
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const grouped = ingredients.reduce<Record<string, Ingredient[]>>((acc, ing) => {
    const group = ing.group || "";
    (acc[group] ||= []).push(ing);
    return acc;
  }, {});
  const groups = Object.entries(grouped);

  return (
    <div className="space-y-6">
      {groups.map(([group, items]) => (
        <div key={group || "main"}>
          {groups.length > 1 && group && <h3 className="h-card mb-2 text-[var(--color-text)]">{group}</h3>}
          <ul className="border-t border-[var(--color-line)]">
            {items.map((ing) => {
              const isChecked = checked.has(ing.id);
              const id = `ing-${ing.id}`;
              const amount = displayAmount(ing.amount, factor, ing.unit, ing.name);
              return (
                <li key={ing.id} className="border-b border-[var(--color-line)]">
                  <label htmlFor={id} className="flex items-start gap-3.5 cursor-pointer py-3 text-body min-h-11">
                    <input
                      id={id}
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggle(ing.id)}
                      className="mt-1 size-[22px] shrink-0 rounded-sm accent-[var(--color-cheek)] cursor-pointer"
                    />
                    <span className={cn("text-[var(--color-text)] transition-[opacity] duration-150", isChecked && "line-through decoration-[var(--color-text-3)] opacity-55")}>
                      {(amount.text || ing.unit) && (
                        <strong className="font-semibold">
                          {amount.text}
                          {amount.text && ing.unit ? " " : ""}
                          {ing.unit}
                        </strong>
                      )}{" "}
                      {ing.name}
                      {amount.note && <span className="text-[var(--color-text-2)]"> {amount.note}</span>}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
