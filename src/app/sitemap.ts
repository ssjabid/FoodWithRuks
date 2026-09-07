import { MetadataRoute } from "next";
import { SAMPLE_RECIPES, SAMPLE_LIFESTYLE_POSTS } from "@/lib/sampleData";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/recipes`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/lifestyle`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];

  // Recipe pages (TODO: replace with Firebase query)
  const recipePages: MetadataRoute.Sitemap = SAMPLE_RECIPES.map((recipe) => ({
    url: `${SITE_URL}/recipes/${recipe.slug}`,
    lastModified: recipe.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Lifestyle article pages (TODO: replace with Firebase query)
  const lifestylePages: MetadataRoute.Sitemap = SAMPLE_LIFESTYLE_POSTS
    .filter((post) => post.status === "published")
    .map((post) => ({
      url: `${SITE_URL}/lifestyle/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));

  return [...staticPages, ...recipePages, ...lifestylePages];
}
