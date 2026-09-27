"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Photo } from "@/components/shared/Photo";
import type { Instruction } from "@/types";

/** Numbered because it is a real sequence. Tap a step to tick it off; the state lives only on this page. */
export function MethodSteps({ steps }: { steps: Instruction[] }) {
  const [done, setDone] = useState<Set<number>>(new Set());
  const toggle = (n: number) =>
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      return next;
    });

  return (
    <ol className="border-t border-[var(--color-line)]">
      {steps.map((step) => {
        const isDone = done.has(step.step);
        return (
          <li key={step.step} className={cn("border-b border-[var(--color-line)]", isDone && "step-done")}>
            <button
              type="button"
              onClick={() => toggle(step.step)}
              aria-pressed={isDone}
              className="grid grid-cols-[36px_1fr] gap-3.5 w-full text-left py-4 rounded-[var(--radius-sm)]"
            >
              <span
                aria-hidden="true"
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors",
                  isDone ? "bg-[var(--color-surface)] text-[var(--color-text-3)]" : "bg-[var(--color-cheek)] text-[var(--color-on-cheek)]"
                )}
              >
                {step.step}
              </span>
              <span className="min-w-0 pt-0.5">
                <span className="step-text block text-body text-[var(--color-text)]">{step.text}</span>
                <span className="sr-only">{isDone ? " (done)" : ""}</span>
              </span>
            </button>
            {step.image && (
              <div className="pl-[50px] pb-4 -mt-1">
                <Photo src={step.image} alt={step.imageAlt || ""} fit="natural" sizes="(min-width: 1024px) 640px, 100vw" className="w-full max-w-lg" caption={false} />
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
