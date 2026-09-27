import { ovenLine } from "@/lib/oven";
import { COPY } from "@/lib/copy";
import type { Oven } from "@/types";

/** Her setting first, then the conversions, then one quiet line. */
export function OvenLine({ oven }: { oven: Oven }) {
  const line = ovenLine(oven);
  return (
    <div className="rounded-[var(--radius-md)] bg-[var(--color-surface)] px-4 py-3.5 my-6">
      <p className="text-sm text-[var(--color-text-2)]">Oven</p>
      <p className="text-[1.25rem] font-semibold text-[var(--color-text)] leading-tight mt-0.5">{line.primary}</p>
      {line.secondary && <p className="text-[15px] text-[var(--color-text-2)] mt-0.5">{line.secondary}</p>}
      {/* DRAFT: needs Ruks */}
      <p className="text-xs text-[var(--color-text-3)] mt-2">{COPY.ovenNote}</p>
    </div>
  );
}
