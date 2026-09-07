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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
      <div className="h-10 w-48 rounded-[var(--radius-sm)] bg-[var(--color-secondary)] mb-10" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
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
