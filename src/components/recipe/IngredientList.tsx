"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Ingredient } from "@/types";

interface IngredientListProps {
  ingredients: Ingredient[];
  originalServings: number;
  currentServings: number;
}

export function IngredientList({ ingredients, originalServings, currentServings }: IngredientListProps) {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const ratio = currentServings / originalServings;

  const toggle = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const adjustAmount = (amount: string): string => {
    const num = parseFloat(amount);
    if (isNaN(num)) return amount;
    const adjusted = num * ratio;
    if (adjusted === Math.floor(adjusted)) return String(adjusted);
    return adjusted.toFixed(1).replace(/\.0$/, "");
  };

  const grouped = ingredients.reduce<Record<string, Ingredient[]>>((acc, ing) => {
    const group = ing.group || "Ingredients";
    if (!acc[group]) acc[group] = [];
    acc[group].push(ing);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([group, items]) => (
        <div key={group}>
          {Object.keys(grouped).length > 1 && (
            <h4 className="h-card mb-3 text-[var(--color-text-primary)]">{group}</h4>
          )}
          <ul className="divide-y divide-[var(--color-border)]">
            {items.map((ing) => {
              const isChecked = checked.has(ing.id);
              const id = `ing-${ing.id}`;
              return (
                <li key={ing.id}>
                  <label htmlFor={id} className="flex items-start gap-3 cursor-pointer py-2.5 text-body">
                    <input
                      id={id}
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggle(ing.id)}
                      className="mt-1.5 size-4 shrink-0 rounded-sm accent-[var(--color-primary)] cursor-pointer"
                    />
                    <span
                      className={cn(
                        "text-[var(--color-text-primary)] transition-[opacity,text-decoration-color] duration-150",
                        isChecked && "line-through decoration-[var(--color-text-tertiary)] opacity-55"
                      )}
                    >
                      <strong className="font-semibold">
                        {adjustAmount(ing.amount)} {ing.unit}
                      </strong>{" "}
                      {ing.name}
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
