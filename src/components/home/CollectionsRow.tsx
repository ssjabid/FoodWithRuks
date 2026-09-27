import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Collection } from "@/lib/collections";
import type { Recipe } from "@/types";

interface CollectionsRowProps {
  rows: Array<{ collection: Collection; recipes: Recipe[] }>;
}

/** Only collections with something in them, the active seasonal one first. Scrolls sideways on a phone. */
export function CollectionsRow({ rows }: CollectionsRowProps) {
  return (
    <section className="py-6 sm:py-10" aria-label="Collections">
      <ul className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap [scrollbar-width:none]">
        {rows.map(({ collection }) => (
          <li key={collection.slug} className="shrink-0">
            <Link
              href={`/collections/${collection.slug}`}
              className={cn(
                "block min-w-[160px] rounded-[var(--radius-lg)] px-4 py-3.5 transition-colors",
                collection.sage
                  ? "bg-[var(--color-sage-soft)] text-[var(--color-sage-ink)] hover:bg-[color-mix(in_srgb,var(--color-sage-soft)_85%,var(--color-sage)_15%)]"
                  : "bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-blush)]"
              )}
            >
              <span className="block font-heading text-[1.125rem] font-medium leading-tight">{collection.title}</span>
              {/* DRAFT: needs Ruks */}
              <span className={cn("block text-[13px] mt-1", collection.sage ? "" : "text-[var(--color-text-2)]")}>{collection.intro.split(".")[0]}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
