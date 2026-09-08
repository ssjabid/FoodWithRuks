import Link from "next/link";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { FoodPlaceholder } from "@/components/shared/FoodPlaceholder";
import { getCategoryLabel } from "@/lib/constants";
import type { Recipe } from "@/types";

interface MostLovedProps {
  recipes: Recipe[];
}

/** Compact list rows: square thumb, title, two-line excerpt. Renders only with 3+ recipes. */
export function MostLoved({ recipes }: MostLovedProps) {
  if (recipes.length < 3) return null;

  return (
    <section className="py-12 sm:py-16">
      <div className="max-w-wide mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="Most loved" title="The ones everyone asks for" />
        <ul className="grid md:grid-cols-2 gap-x-12">
          {recipes.slice(0, 4).map((recipe) => (
            <li key={recipe.id} className="border-b border-[var(--color-border)]">
              <Link href={`/recipes/${recipe.slug}`} className="group grid grid-cols-[96px_1fr] gap-4 py-4">
                <FoodPlaceholder ratio="square" className="w-24 group-hover:opacity-90 transition-opacity" />
                <div className="min-w-0">
                  <p className="eyebrow mb-1">{recipe.category[0] ? getCategoryLabel(recipe.category[0]) : "Recipe"}</p>
                  <h3 className="h-card text-[var(--color-text-primary)] group-hover:underline underline-offset-[3px] decoration-1 mb-1">
                    {recipe.title}
                  </h3>
                  <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2">{recipe.description}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
