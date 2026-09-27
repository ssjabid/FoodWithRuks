import { Mark } from "@/components/brand/Mark";
import { COPY } from "@/lib/copy";

/** Shown on the one example bake in production, so nobody mistakes it for hers. */
export function ExampleBanner() {
  return (
    <div className="rounded-[var(--radius-md)] bg-[var(--color-warning-bg)] text-[var(--color-text)] px-4 py-3 mb-8 flex items-start gap-3">
      <Mark state="open" size={24} className="shrink-0 mt-0.5" />
      <p className="text-sm">
        <strong className="font-semibold">{COPY.exampleLabel}.</strong> {COPY.exampleBanner}
      </p>
    </div>
  );
}
