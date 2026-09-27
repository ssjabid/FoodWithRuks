import { SectionHeader } from "@/components/shared/SectionHeader";
import { RecipeCard } from "@/components/recipe/RecipeCard";
import type { Recipe } from "@/types";

interface NewOutOfTheOvenProps {
  recipes: Recipe[];
  /** Sits under the small rows on desktop (the Currently card) */
  aside?: React.ReactNode;
}

/** The newest bake large, the next two as compact rows beside it. Not three identical cards. */
export function NewOutOfTheOven({ recipes, aside }: NewOutOfTheOvenProps) {
  if (recipes.length === 0) return null;
  const [first, ...others] = recipes;
  return (
    <section className="py-10 sm:py-14">
      <SectionHeader title="New out of the oven" href="/bakes" linkLabel="All the bakes" />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-10 items-start">
        <RecipeCard recipe={first} size="large" />
        {(others.length > 0 || aside) && (
          <div className="flex flex-col gap-6">
            {others.map((r) => (
              <RecipeCard key={r.id} recipe={r} size="small" />
            ))}
            {aside && <div className={others.length > 0 ? "pt-2" : undefined}>{aside}</div>}
          </div>
        )}
      </div>
    </section>
  );
}
