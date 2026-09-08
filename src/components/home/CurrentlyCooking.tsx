import { SectionHeader } from "@/components/shared/SectionHeader";
import { RecipeCard } from "@/components/recipe/RecipeCard";
import type { Recipe } from "@/types";

interface CurrentlyCookingProps {
  recipes: Recipe[];
}

export function CurrentlyCooking({ recipes }: CurrentlyCookingProps) {
  if (recipes.length === 0) return null;

  return (
    <section className="py-12 sm:py-16">
      <div className="max-w-wide mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="Currently cooking" title="Fresh from the kitchen" href="/recipes" linkLabel="All recipes" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-10">
          {recipes.slice(0, 3).map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      </div>
    </section>
  );
}
