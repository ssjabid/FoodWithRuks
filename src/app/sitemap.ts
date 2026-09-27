import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { getPublishedRecipes } from "@/lib/firebase/recipes";
import { getPostSitemapEntries } from "@/lib/firebase/lifestyle";
import { nonEmptyCollections } from "@/lib/collections";
import { getCategoryGroup } from "@/lib/constants";
import type { Recipe } from "@/types";

export const revalidate = 3600;

/**
 * Real published content only: the development fixtures and the production example
 * bake never appear here. Collections are listed only when something is in them.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  let recipes: Recipe[] = [];
  try {
    recipes = await getPublishedRecipes({ limit: 100 });
  } catch (error) {
    console.error("[sitemap] recipes unavailable:", error);
  }

  let posts: { slug: string; updatedAt: Date }[] = [];
  try {
    posts = await getPostSitemapEntries();
  } catch (error) {
    console.error("[sitemap] stories unavailable:", error);
  }

  const hasCooking = recipes.some((r) => r.category.some((c) => getCategoryGroup(c) === "cooking"));

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/bakes`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/recipes`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    ...(hasCooking ? [{ url: `${SITE_URL}/cooking`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.7 }] : []),
    { url: `${SITE_URL}/lifestyle`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/newsletter`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];

  return [
    ...staticPages,
    ...nonEmptyCollections(recipes).map(({ collection, recipes: inIt }) => ({
      url: `${SITE_URL}/collections/${collection.slug}`,
      lastModified: inIt.reduce((latest, r) => (r.updatedAt > latest ? r.updatedAt : latest), inIt[0].updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...recipes.map((r) => ({
      url: `${SITE_URL}/recipes/${r.slug}`,
      lastModified: r.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...posts.map((p) => ({
      url: `${SITE_URL}/lifestyle/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
