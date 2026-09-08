import Link from "next/link";
import { SectionHeader } from "@/components/shared/SectionHeader";
import type { CategoryCount } from "@/lib/categoryCounts";

interface ExploreByCategoryProps {
  counts: CategoryCount[];
}

/** "Explore by category" — a two-column list with recipe counts (Moribyan-style). */
export function ExploreByCategory({ counts }: ExploreByCategoryProps) {
  return (
    <section className="py-12 sm:py-16 bg-[var(--color-surface)]">
      <div className="max-w-wide mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="Explore by category" title="What to eat?" />
        <ul className="grid md:grid-cols-2 gap-x-12">
          {counts.map(({ item, count }) => (
            <li key={item.key} className="border-b border-[var(--color-border)]">
              <Link
                href={`/recipes?${item.param}=${item.value}`}
                className="group flex items-baseline justify-between gap-4 py-3.5"
              >
                <span className="font-heading text-xl text-[var(--color-text-primary)] group-hover:text-[var(--color-primary)] group-hover:underline underline-offset-4 decoration-1 transition-colors">
                  {item.label}
                </span>
                <span className="text-sm tabular-nums text-[var(--color-text-tertiary)]">{count}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
