import { HeroSection } from "@/components/home/HeroSection";
import { RecipeOfTheWeek } from "@/components/home/RecipeOfTheWeek";
import { WhatToEatSection } from "@/components/home/WhatToEatSection";
import { LatestRecipes } from "@/components/home/LatestRecipes";
import { LifestyleTeaser } from "@/components/home/LifestyleTeaser";
import { InstagramBlock } from "@/components/home/InstagramBlock";
import { NewsletterSection } from "@/components/home/NewsletterSection";
import { getPublishedRecipes, getRecipeOfTheWeek } from "@/lib/firebase/recipes";
import { getPublishedPosts } from "@/lib/firebase/lifestyle";
import { SAMPLE_RECIPES, SAMPLE_LIFESTYLE_POSTS } from "@/lib/sampleData";
import type { Recipe, LifestylePost } from "@/types";

export const revalidate = 3600;

const byNewest = (a: Recipe, b: Recipe) =>
  new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime();

export default async function HomePage() {
  const [rotwResult, latestResult, postsResult] = await Promise.allSettled([
    getRecipeOfTheWeek(),
    getPublishedRecipes({ limit: 6 }),
    getPublishedPosts(),
  ]);

  const sampleNewest = [...SAMPLE_RECIPES].sort(byNewest);

  let latest: Recipe[];
  if (latestResult.status === "fulfilled" && latestResult.value.length > 0) {
    latest = latestResult.value;
  } else {
    if (latestResult.status === "rejected") {
      console.error("[home] latest recipes fetch failed, using sample data:", latestResult.reason);
    }
    latest = sampleNewest.slice(0, 6);
  }

  let recipeOfTheWeek: Recipe | null;
  if (rotwResult.status === "fulfilled" && rotwResult.value) {
    recipeOfTheWeek = rotwResult.value;
  } else {
    if (rotwResult.status === "rejected") {
      console.error("[home] recipe of the week fetch failed, using sample data:", rotwResult.reason);
    }
    recipeOfTheWeek = sampleNewest[0] ?? null;
  }

  let posts: LifestylePost[];
  if (postsResult.status === "fulfilled" && postsResult.value.length > 0) {
    posts = postsResult.value;
  } else {
    if (postsResult.status === "rejected") {
      console.error("[home] lifestyle posts fetch failed, using sample data:", postsResult.reason);
    }
    posts = SAMPLE_LIFESTYLE_POSTS;
  }

  // Don't repeat the pinned recipe in the "latest" strip
  const latestWithoutPinned = latest.filter((r) => r.slug !== recipeOfTheWeek?.slug).slice(0, 3);

  return (
    <>
      <HeroSection />
      {recipeOfTheWeek && <RecipeOfTheWeek recipe={recipeOfTheWeek} />}
      <WhatToEatSection />
      <LatestRecipes recipes={latestWithoutPinned} />
      <LifestyleTeaser posts={posts.slice(0, 3)} />
      <InstagramBlock />
      <NewsletterSection />
    </>
  );
}
