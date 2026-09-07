"use client";

import { useState } from "react";
import { motion } from "framer-motion";
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
            <h4 className="font-bold tracking-tight text-lg mb-3 text-[var(--color-text-primary)]">
              {group}
            </h4>
          )}
          <ul className="space-y-2">
            {items.map((ing) => {
              const isChecked = checked.has(ing.id);
              return (
                <li key={ing.id}>
                  <motion.label
                    className="flex items-start gap-3 cursor-pointer group py-1"
                    animate={{ opacity: isChecked ? 0.5 : 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div
                      className={cn(
                        "mt-1 w-4 h-4 rounded border-2 flex items-center justify-center shrink-0",
                        isChecked
                          ? "bg-[var(--color-primary)] border-[var(--color-primary)]"
                          : "border-[var(--color-border)] group-hover:border-[var(--color-primary)]"
                      )}
                      animate={isChecked ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                      transition={{ type: "tween", duration: 0.25 }}
                      onClick={() => toggle(ing.id)}
                    >
                      {isChecked && (
                        <motion.svg
                          className="w-2.5 h-2.5 text-[var(--color-on-primary)]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </motion.svg>
                      )}
                    </motion.div>
                    <span
                      className={cn(
                        "text-[var(--color-text-primary)] transition-all duration-300",
                        isChecked && "line-through decoration-[var(--color-primary)]/50"
                      )}
                    >
                      <strong>{adjustAmount(ing.amount)} {ing.unit}</strong> {ing.name}
                    </span>
                  </motion.label>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
