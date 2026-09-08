import Link from "next/link";
import { FoodPlaceholder } from "@/components/shared/FoodPlaceholder";
import { getCategoryLabel } from "@/lib/constants";
import { formatCookTime } from "@/lib/utils";
import type { Recipe } from "@/types";

interface FeaturedRecipeProps {
  recipe: Recipe;
}

/** "New this week" feature card, shown beside the hero copy. */
export function FeaturedRecipe({ recipe }: FeaturedRecipeProps) {
  const total = recipe.prepTime + recipe.cookTime;
  return (
    <Link href={`/recipes/${recipe.slug}`} className="group block rounded-[var(--radius-md)]">
      <p className="eyebrow mb-3">New this week</p>
      <FoodPlaceholder ratio="landscape" className="w-full group-hover:opacity-90 transition-opacity" />
      <div className="pt-4">
        <h2 className="h-section text-[var(--color-text-primary)] group-hover:underline underline-offset-4 decoration-1 mb-2">
          {recipe.title}
        </h2>
        <p className="text-[var(--color-text-secondary)] line-clamp-2 mb-3">{recipe.description}</p>
        <p className="text-sm text-[var(--color-text-tertiary)]">
          {recipe.category[0] ? `${getCategoryLabel(recipe.category[0])} · ` : ""}
          {formatCookTime(total)} · {recipe.servings} servings
        </p>
      </div>
    </Link>
  );
}
