"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Badge } from "@/components/ui/Badge";
import { StarRating } from "@/components/ui/StarRating";
import { Chevron } from "@/components/ui/Chevron";
import { FavoriteButton } from "@/components/shared/FavoriteButton";
import { FoodPlaceholder } from "@/components/shared/FoodPlaceholder";
import { ServingsAdjuster } from "@/components/recipe/ServingsAdjuster";
import { IngredientList } from "@/components/recipe/IngredientList";
import { InstructionStep } from "@/components/recipe/InstructionStep";
import { ShareButtons } from "@/components/recipe/ShareButtons";
import { PrintButton } from "@/components/recipe/PrintButton";
import { JumpToRecipe } from "@/components/recipe/JumpToRecipe";
import { RecipeCard } from "@/components/recipe/RecipeCard";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { formatDate, formatCookTime } from "@/lib/utils";
import { getCategoryLabel } from "@/lib/constants";
import { isInstagramUrl } from "@/components/recipe/InstagramEmbed";
import { Skeleton } from "@/components/ui/Skeleton";
import type { Recipe } from "@/types";

const InstagramEmbed = dynamic(() => import("@/components/recipe/InstagramEmbed").then((m) => m.InstagramEmbed), {
  ssr: false,
  loading: () => <Skeleton className="mx-auto h-[480px] w-full max-w-[328px] rounded-[var(--radius-lg)]" />,
});

interface RecipePageClientProps {
  recipe: Recipe;
  relatedRecipes: Recipe[];
}

export function RecipePageClient({ recipe, relatedRecipes }: RecipePageClientProps) {
  const [servings, setServings] = useState(recipe.servings);
  const [nutritionOpen, setNutritionOpen] = useState(false);
  const hasEmbed = isInstagramUrl(recipe.instagramUrl);

  return (
    <article className="max-w-wide mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <div className="max-w-prose">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            {recipe.category.map((cat) => (
              <Badge key={cat} variant="accent">{getCategoryLabel(cat)}</Badge>
            ))}
            {recipe.dietaryTags.map((tag) => (
              <Badge key={tag} variant="outline">{tag}</Badge>
            ))}
          </div>
          <h1 className="h-page text-[var(--color-text-primary)] mb-4">{recipe.title}</h1>
          <p className="text-body text-[var(--color-text-secondary)] mb-4">{recipe.description}</p>
          <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--color-text-tertiary)]">
            {recipe.publishedAt && <span>{formatDate(recipe.publishedAt)}</span>}
            {recipe.rating.count > 0 && (
              <span className="flex items-center gap-1.5">
                <StarRating rating={Math.round(recipe.rating.average)} size="sm" />
                <span>({recipe.rating.count})</span>
              </span>
            )}
            <FavoriteButton slug={recipe.slug} className="bg-transparent hover:bg-[var(--color-secondary)]" />
          </div>
        </header>
      </div>

      {/* Hero: placeholder (+ Instagram reel when provided) */}
      <div className={hasEmbed ? "mb-10 grid gap-6 lg:grid-cols-[1fr_360px] items-start" : "mb-10 max-w-prose"}>
        <FoodPlaceholder className={hasEmbed ? "w-full h-72 sm:h-96 lg:h-full lg:min-h-[480px]" : "w-full h-72 sm:h-96"} />
        {hasEmbed && <InstagramEmbed url={recipe.instagramUrl!} />}
      </div>

      <div className="max-w-prose">
        {/* Personal story */}
        {recipe.personalStory && (
          <div className="mb-10 pl-5 border-l-2 border-[var(--color-accent)]">
            <p className="accent-italic text-xl leading-relaxed">{recipe.personalStory}</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6 p-5 rounded-[var(--radius-md)] bg-[var(--color-surface)]">
          <StatItem label="Prep" value={formatCookTime(recipe.prepTime)} />
          <StatItem label="Cook" value={formatCookTime(recipe.cookTime)} />
          <StatItem label="Total" value={formatCookTime(recipe.prepTime + recipe.cookTime)} />
          <div>
            <p className="eyebrow mb-1">Servings</p>
            <ServingsAdjuster servings={servings} onChange={setServings} />
          </div>
          <StatItem label="Difficulty" value={recipe.difficulty} />
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2 mb-12">
          <JumpToRecipe />
          <PrintButton />
          <ShareButtons title={recipe.title} slug={recipe.slug} />
        </div>

        {/* Ingredients */}
        <section id="ingredients" className="mb-12 scroll-mt-20">
          <h2 className="h-section text-[var(--color-text-primary)] mb-5">Ingredients</h2>
          <IngredientList ingredients={recipe.ingredients} originalServings={recipe.servings} currentServings={servings} />
        </section>

        {/* Instructions */}
        <section className="mb-12">
          <h2 className="h-section text-[var(--color-text-primary)] mb-3">Method</h2>
          <ol>
            {recipe.instructions.map((instruction) => (
              <InstructionStep key={instruction.step} instruction={instruction} />
            ))}
          </ol>
        </section>

        {/* Tips */}
        {recipe.tips && (
          <section className="mb-12 p-5 rounded-[var(--radius-md)] bg-[var(--color-accent-soft)] text-[var(--color-text-primary)]">
            <p className="eyebrow mb-2 text-[var(--color-accent-text)]">Tips & notes</p>
            <p className="text-body">{recipe.tips}</p>
          </section>
        )}

        {/* Nutrition */}
        {recipe.nutrition && (
          <section className="mb-12 border-t border-b border-[var(--color-border)]">
            <button
              type="button"
              onClick={() => setNutritionOpen(!nutritionOpen)}
              aria-expanded={nutritionOpen}
              aria-controls="nutrition-panel"
              className="flex w-full items-center justify-between py-4 text-left"
            >
              <span className="h-card text-[var(--color-text-primary)]">Nutrition</span>
              <Chevron open={nutritionOpen} className="w-5 h-5 text-[var(--color-text-tertiary)]" />
            </button>
            <div id="nutrition-panel" className="accordion" data-open={nutritionOpen}>
              <div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-5">
                  {recipe.nutrition.calories && <NutritionItem label="Calories" value={`${recipe.nutrition.calories}`} />}
                  {recipe.nutrition.protein && <NutritionItem label="Protein" value={`${recipe.nutrition.protein}g`} />}
                  {recipe.nutrition.carbs && <NutritionItem label="Carbs" value={`${recipe.nutrition.carbs}g`} />}
                  {recipe.nutrition.fat && <NutritionItem label="Fat" value={`${recipe.nutrition.fat}g`} />}
                </div>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Related */}
      {relatedRecipes.length > 0 && (
        <section className="mt-16 related-recipes">
          <SectionHeader eyebrow="Keep cooking" title="You might also like" href="/recipes" linkLabel="All recipes" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
            {relatedRecipes.map((r) => (
              <RecipeCard key={r.id} recipe={r} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="eyebrow mb-1">{label}</p>
      <p className="font-medium text-[var(--color-text-primary)] capitalize">{value}</p>
    </div>
  );
}

function NutritionItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="eyebrow">{label}</p>
      <p className="text-lg font-medium text-[var(--color-text-primary)]">{value}</p>
    </div>
  );
}
