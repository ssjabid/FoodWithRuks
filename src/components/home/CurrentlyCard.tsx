import { cn } from "@/lib/utils";
import { formatMonth } from "@/lib/facts";
import type { Currently } from "@/types";

interface CurrentlyCardProps {
  currently: Currently;
  className?: string;
}

const ROWS: Array<{ key: keyof Omit<Currently, "updatedAt">; label: string }> = [
  { key: "baking", label: "Baking" },
  { key: "craving", label: "Craving" },
  { key: "lastWalk", label: "Last walk" },
  { key: "latestParcel", label: "Parcel" },
];

/** The blush card: four short lines she updates from her phone. Empty rows hide; the whole card hides when all are empty. */
export function CurrentlyCard({ currently, className }: CurrentlyCardProps) {
  const rows = ROWS.filter((r) => currently[r.key]);
  if (rows.length === 0) return null;
  return (
    <aside className={cn("rounded-[var(--radius-lg)] bg-[var(--color-blush)] text-[var(--color-on-blush)] px-5 py-5 sm:px-6", className)} aria-labelledby="currently-title">
      <h2 id="currently-title" className="h-card mb-3">
        Currently
      </h2>
      <dl className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-2">
        {rows.map((r) => (
          <div key={r.key} className="contents">
            <dt className="text-[var(--color-text-2)]">{r.label}</dt>
            <dd className="m-0">{currently[r.key]}</dd>
          </div>
        ))}
      </dl>
      {currently.updatedAt && <p className="mt-4 text-xs text-[var(--color-text-2)]">Updated {formatMonth(currently.updatedAt)}</p>}
    </aside>
  );
}
