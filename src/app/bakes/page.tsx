import type { Metadata } from "next";
import { Suspense } from "react";
import { RecipesClient, RecipesFallback } from "@/app/recipes/RecipesClient";
import { getRecipePool } from "@/lib/recipePool";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Bakes",
  description: "Cookies, brownies, cakes, cheesecakes, pastries and bread from Ruks's kitchen.",
  alternates: { canonical: "/bakes" },
};

export default async function BakesPage() {
  const recipes = await getRecipePool();
  return (
    <Suspense fallback={<RecipesFallback title="Bakes" />}>
      <RecipesClient recipes={recipes} fixedGroup="bakes" />
    </Suspense>
  );
}
