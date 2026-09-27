import type { Metadata } from "next";
import { Suspense } from "react";
import { RecipesClient, RecipesFallback } from "@/app/recipes/RecipesClient";
import { getRecipePool } from "@/lib/recipePool";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Cooking",
  description: "The savoury side of Ruks's kitchen: starters, mains, sides and snacks.",
  alternates: { canonical: "/cooking" },
};

export default async function CookingPage() {
  const recipes = await getRecipePool();
  return (
    <Suspense fallback={<RecipesFallback title="Cooking" />}>
      <RecipesClient recipes={recipes} fixedGroup="cooking" />
    </Suspense>
  );
}
