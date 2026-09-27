import { SAMPLE_LIFESTYLE_POSTS, SAMPLE_RECIPES } from "@/lib/sampleData";
import type { LifestylePost, Recipe } from "@/types";

/**
 * What fills an empty database. Fixtures are development furniture, never
 * presented as hers:
 *  - development and preview deployments: the full fixture set
 *  - production: exactly one example bake, always labelled "Example"
 * Nothing here is returned once a real published recipe exists.
 */

export const IS_PRODUCTION = process.env.VERCEL_ENV === "production";

/** True when the site is standing in for real content (used to show the honest empty state). */
export function usingFixtures(real: Recipe[]): boolean {
  return real.length === 0;
}

export function recipesOrFixtures(real: Recipe[]): Recipe[] {
  if (real.length > 0) return real;
  return IS_PRODUCTION ? SAMPLE_RECIPES.slice(0, 1) : SAMPLE_RECIPES;
}

export function postsOrFixtures(real: LifestylePost[]): LifestylePost[] {
  if (real.length > 0) return real;
  return IS_PRODUCTION ? [] : SAMPLE_LIFESTYLE_POSTS;
}

export function fixtureRecipeBySlug(slug: string): Recipe | null {
  const pool = IS_PRODUCTION ? SAMPLE_RECIPES.slice(0, 1) : SAMPLE_RECIPES;
  return pool.find((r) => r.slug === slug) ?? null;
}

export function fixturePostBySlug(slug: string): LifestylePost | null {
  if (IS_PRODUCTION) return null;
  return SAMPLE_LIFESTYLE_POSTS.find((p) => p.slug === slug) ?? null;
}

export function isExample(recipe: Pick<Recipe, "sample">): boolean {
  return recipe.sample === true;
}
