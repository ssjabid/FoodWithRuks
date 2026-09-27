import { getPublishedRecipes } from "@/lib/firebase/recipes";
import { recipesOrFixtures } from "@/lib/content";
import type { Recipe } from "@/types";

/**
 * The cached published list every index page reads (the same query as the home page,
 * so ISR shares it). Falls back to the development fixtures when the database is
 * empty, and to whatever the fixtures policy allows when Firestore is unreachable.
 */
export async function getRecipePool(): Promise<Recipe[]> {
  try {
    return recipesOrFixtures(await getPublishedRecipes({ limit: 100 }));
  } catch (error) {
    console.error("[recipes] Firestore fetch failed:", error);
    return recipesOrFixtures([]);
  }
}
