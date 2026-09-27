import type { Metadata } from "next";
import { Suspense } from "react";
import { RecipesClient, RecipesFallback } from "./RecipesClient";
import { getRecipePool } from "@/lib/recipePool";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Recipes",
  description: "Every recipe on the site: the bakes first, then the cooking.",
};

export default async function RecipesPage() {
  const recipes = await getRecipePool();
  return (
    <Suspense fallback={<RecipesFallback />}>
      <RecipesClient recipes={recipes} />
    </Suspense>
  );
}
