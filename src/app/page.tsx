import { HeroSection } from "@/components/home/HeroSection";
import { CurrentlyCooking } from "@/components/home/CurrentlyCooking";
import { ExploreByCategory } from "@/components/home/ExploreByCategory";
import { MostLoved } from "@/components/home/MostLoved";
import { LifestyleTeaser } from "@/components/home/LifestyleTeaser";
import { InstagramBlock } from "@/components/home/InstagramBlock";
import { NewsletterSection } from "@/components/home/NewsletterSection";
import { getPublishedRecipes, getRecipeOfTheWeek } from "@/lib/firebase/recipes";
import { getPublishedPosts } from "@/lib/firebase/lifestyle";
import { getCategoryCounts } from "@/lib/categoryCounts";
import { SAMPLE_RECIPES, SAMPLE_LIFESTYLE_POSTS } from "@/lib/sampleData";
import type { Recipe, LifestylePost } from "@/types";

export const revalidate = 3600;

const byNewest = (a: Recipe, b: Recipe) =>
  new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime();

const byLoved = (a: Recipe, b: Recipe) =>
  b.viewCount - a.viewCount || b.rating.count - a.rating.count || byNewest(a, b);

export default async function HomePage() {
  const [rotwResult, recipesResult, postsResult] = await Promise.allSettled([
    getRecipeOfTheWeek(),
    getPublishedRecipes({ limit: 100 }),
    getPublishedPosts(),
  ]);

  let recipes: Recipe[];
  if (recipesResult.status === "fulfilled" && recipesResult.value.length > 0) {
    recipes = recipesResult.value;
  } else {
    if (recipesResult.status === "rejected") {
      console.error("[home] recipes fetch failed, using sample data:", recipesResult.reason);
    }
    recipes = SAMPLE_RECIPES;
  }

  let featured: Recipe | null;
  if (rotwResult.status === "fulfilled" && rotwResult.value) {
    featured = rotwResult.value;
  } else {
    if (rotwResult.status === "rejected") {
      console.error("[home] recipe of the week fetch failed, using latest:", rotwResult.reason);
    }
    featured = [...recipes].sort(byNewest)[0] ?? null;
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

  const notFeatured = recipes.filter((r) => r.slug !== featured?.slug);
  const latest = [...notFeatured].sort(byNewest).slice(0, 3);
  const latestSlugs = new Set(latest.map((r) => r.slug));
  const mostLoved = [...notFeatured].filter((r) => !latestSlugs.has(r.slug)).sort(byLoved).slice(0, 4);
  const counts = getCategoryCounts(recipes);

  return (
    <>
      <HeroSection recipe={featured} />
      <CurrentlyCooking recipes={latest} />
      <ExploreByCategory counts={counts} />
      <MostLoved recipes={mostLoved} />
      <LifestyleTeaser posts={posts.slice(0, 3)} />
      <InstagramBlock />
      <NewsletterSection />
    </>
  );
}
