import type { Metadata } from "next";
import { Suspense } from "react";
import { RecipesClient } from "./RecipesClient";
import { getPublishedRecipes } from "@/lib/firebase/recipes";
import { SAMPLE_RECIPES } from "@/lib/sampleData";
import { RecipeCardSkeleton } from "@/components/ui/Skeleton";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Recipes",
  description: "Browse every recipe from Agooh & Ruks — wholesome, easy-to-follow food for your soul.",
};

function RecipesFallback() {
  return (
    <div className="max-w-wide mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <div className="mb-8">
        <p className="eyebrow mb-2">Recipes</p>
        <h1 className="h-page text-[var(--color-text-primary)] mb-2">What to eat?</h1>
        <p className="text-[var(--color-text-secondary)] text-lg">Pick a craving, or search for something specific.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
        {Array.from({ length: 6 }).map((_, i) => (
          <RecipeCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export default async function RecipesPage() {
  let recipes;
  try {
    recipes = await getPublishedRecipes({ limit: 200 });
    if (recipes.length === 0) recipes = SAMPLE_RECIPES;
  } catch (error) {
    console.error("[recipes] Firestore fetch failed, using sample data:", error);
    recipes = SAMPLE_RECIPES;
  }

  return (
    <Suspense fallback={<RecipesFallback />}>
      <RecipesClient initialRecipes={recipes} />
    </Suspense>
  );
}
