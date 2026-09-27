import { Mark } from "@/components/brand/Mark";
import { COPY } from "@/lib/copy";

/** Production, before the first real bake is published: honest, short, and the example sits underneath. */
export function EmptyKitchen() {
  return (
    <section className="rounded-[var(--radius-lg)] bg-[var(--color-surface)] px-5 py-6 sm:px-8 sm:py-8 mb-10 flex items-start gap-5">
      <Mark state="asleep" size={44} className="shrink-0 mt-1" />
      <div>
        {/* DRAFT: needs Ruks */}
        <h2 className="h-section text-[var(--color-text)]">{COPY.emptyKitchenTitle}</h2>
        <p className="mt-2 text-[var(--color-text-2)] max-w-[50ch]">{COPY.emptyKitchenBody}</p>
      </div>
    </section>
  );
}
