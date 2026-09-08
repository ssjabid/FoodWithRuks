import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { StarRating } from "@/components/ui/StarRating";
import { FavoriteButton } from "@/components/shared/FavoriteButton";
import { FoodPlaceholder } from "@/components/shared/FoodPlaceholder";
import { formatCookTime } from "@/lib/utils";
import { getCategoryLabel } from "@/lib/constants";
import type { Recipe } from "@/types";

interface RecipeCardProps {
  recipe: Recipe;
  /** landscape (default) for grids, square for compact rows */
  ratio?: "landscape" | "square";
}

export function RecipeCard({ recipe, ratio = "landscape" }: RecipeCardProps) {
  const totalTime = recipe.prepTime + recipe.cookTime;

  return (
    <article className="group relative h-full">
      <Link href={`/recipes/${recipe.slug}`} className="block h-full rounded-[var(--radius-md)]">
        <div className="relative">
          <FoodPlaceholder ratio={ratio} className="w-full group-hover:opacity-90 transition-opacity" />
        </div>

        <div className="pt-3">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            {recipe.category.slice(0, 1).map((cat) => (
              <Badge key={cat} variant="accent">{getCategoryLabel(cat)}</Badge>
            ))}
            <span className="text-xs text-[var(--color-text-tertiary)]">{formatCookTime(totalTime)}</span>
          </div>

          <h3 className="h-card text-[var(--color-text-primary)] group-hover:underline underline-offset-[3px] decoration-1 line-clamp-2">
            {recipe.title}
          </h3>

          {recipe.rating.count > 0 && (
            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-[var(--color-text-tertiary)]">
              <StarRating rating={Math.round(recipe.rating.average)} size="sm" />
              <span>({recipe.rating.count})</span>
            </div>
          )}
        </div>
      </Link>

      <div className="absolute top-2 right-2">
        <FavoriteButton slug={recipe.slug} />
      </div>
    </article>
  );
}
