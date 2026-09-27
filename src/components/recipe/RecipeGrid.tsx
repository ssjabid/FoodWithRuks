import { RecipeCard } from "./RecipeCard";
import { RecipeCardSkeleton } from "@/components/ui/Skeleton";
import { COPY } from "@/lib/copy";
import type { Recipe } from "@/types";

interface RecipeGridProps {
  recipes: Recipe[];
  loading?: boolean;
  /** index: the first card is large when there are enough to justify it */
  variant?: "index" | "plain";
  emptyTitle?: string;
  emptyBody?: React.ReactNode;
}

export function RecipeGrid({ recipes, loading, variant = "plain", emptyTitle = COPY.nothingInTin, emptyBody }: RecipeGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-9">
        {Array.from({ length: 6 }).map((_, i) => (
          <RecipeCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <div className="py-16 max-w-md">
        {/* DRAFT: needs Ruks */}
        <h3 className="h-card text-[var(--color-text)] mb-2">{emptyTitle}</h3>
        {emptyBody && <div className="text-[var(--color-text-2)]">{emptyBody}</div>}
      </div>
    );
  }

  const featureFirst = variant === "index" && recipes.length >= 4;
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-9">
      {recipes.map((recipe, i) => (
        <div key={recipe.id} className={featureFirst && i === 0 ? "col-span-2" : undefined}>
          <RecipeCard recipe={recipe} size={featureFirst && i === 0 ? "large" : "default"} priority={i < 2} />
        </div>
      ))}
    </div>
  );
}
