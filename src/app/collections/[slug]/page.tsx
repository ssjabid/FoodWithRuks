import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { COLLECTIONS, getCollection, recipesInCollection } from "@/lib/collections";
import { getRecipePool } from "@/lib/recipePool";
import { IS_PRODUCTION } from "@/lib/content";
import { RecipeGrid } from "@/components/recipe/RecipeGrid";
import { cn } from "@/lib/utils";

export const revalidate = 3600;

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return COLLECTIONS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const collection = getCollection(slug);
  if (!collection) return { title: "Collection not found" };
  return { title: collection.title, description: collection.intro, alternates: { canonical: `/collections/${collection.slug}` } };
}

/** A small parcel tag in clay: the motif for the care-package tips. */
function ParcelTag({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 28" className={className} fill="none" stroke="var(--color-clay)" strokeWidth={1.6} strokeLinejoin="round" strokeLinecap="round" aria-hidden="true">
      <path d="M4 14.5 13.5 5H23v9.5L13.5 24z" />
      <circle cx="18.5" cy="9.5" r="1.6" />
      <path d="M18.5 8c1-3 3-4.5 5.5-4" />
    </svg>
  );
}

/**
 * Collections are filters over the published list, so they need no new data.
 * Empty ones are never linked; in production an empty one is a 404.
 */
export default async function CollectionPage({ params }: Props) {
  const { slug } = await params;
  const collection = getCollection(slug);
  if (!collection) notFound();

  const pool = (await getRecipePool()).filter((r) => !r.sample);
  const recipes = recipesInCollection(pool, collection);
  if (recipes.length === 0 && IS_PRODUCTION) notFound();

  return (
    <div className="max-w-wide mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <header
        className={cn(
          "max-w-prose mb-10",
          collection.sage && "rounded-[var(--radius-lg)] bg-[var(--color-sage-soft)] text-[var(--color-sage-ink)] px-5 py-6 sm:px-7 sm:py-8"
        )}
      >
        <h1 className={cn("h-page", collection.sage ? "" : "text-[var(--color-text)]")}>{collection.title}</h1>
        {/* DRAFT: needs Ruks */}
        <p className={cn("mt-3 text-body", collection.sage ? "" : "text-[var(--color-text-2)]")}>{collection.intro}</p>
      </header>

      {collection.tips && (
        <aside className="max-w-prose mb-12 rounded-[var(--radius-lg)] border border-[var(--color-clay)] px-5 py-5 sm:px-7 sm:py-6" aria-labelledby="tips-title">
          <div className="flex items-center gap-3 mb-3">
            <ParcelTag className="w-7 h-7 shrink-0" />
            {/* DRAFT: needs Ruks */}
            <h2 id="tips-title" className="h-card text-[var(--color-text)]">
              {collection.tips.title}
            </h2>
          </div>
          <ul className="divide-y divide-[var(--color-line)]">
            {collection.tips.items.map((item) => (
              <li key={item} className="py-2.5 text-[var(--color-text-2)]">
                {item}
              </li>
            ))}
          </ul>
        </aside>
      )}

      <RecipeGrid recipes={recipes} variant="index" />
    </div>
  );
}
