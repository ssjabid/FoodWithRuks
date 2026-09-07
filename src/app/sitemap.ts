import type { MetadataRoute } from "next";
import { SAMPLE_RECIPES, SAMPLE_LIFESTYLE_POSTS } from "@/lib/sampleData";
import { SITE_URL } from "@/lib/site";
import { getRecipeSitemapEntries } from "@/lib/firebase/recipes";
import { getPostSitemapEntries } from "@/lib/firebase/lifestyle";

export const revalidate = 3600;

interface Entry {
  slug: string;
  updatedAt: Date;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/recipes`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/lifestyle`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/newsletter`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];

  let recipes: Entry[];
  try {
    recipes = await getRecipeSitemapEntries();
    if (recipes.length === 0) throw new Error("no published recipes");
  } catch (error) {
    console.error("[sitemap] recipes fallback to sample data:", error);
    recipes = SAMPLE_RECIPES.map((r) => ({ slug: r.slug, updatedAt: r.updatedAt }));
  }

  let posts: Entry[];
  try {
    posts = await getPostSitemapEntries();
    if (posts.length === 0) throw new Error("no published posts");
  } catch (error) {
    console.error("[sitemap] lifestyle fallback to sample data:", error);
    posts = SAMPLE_LIFESTYLE_POSTS.filter((p) => p.status === "published").map((p) => ({
      slug: p.slug,
      updatedAt: p.updatedAt,
    }));
  }

  return [
    ...staticPages,
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
