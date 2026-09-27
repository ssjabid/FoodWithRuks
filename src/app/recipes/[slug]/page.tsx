import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getRecipeBySlug, getPublishedRecipes, getAllRecipeSlugs, moreLikeThis } from "@/lib/firebase/recipes";
import { getApprovedComments } from "@/lib/firebase/comments";
import { fixtureRecipeBySlug, recipesOrFixtures } from "@/lib/content";
import { SITE_NAME, AUTHOR_NAME, SITE_URL } from "@/lib/site";
import { getCategoryLabel } from "@/lib/constants";
import { isoDuration, jsonLdYield, totalMinutes } from "@/lib/facts";
import { MIN_RATINGS } from "@/components/recipe/CommentsSection";
import { RecipePageClient } from "./RecipePageClient";
import type { Recipe } from "@/types";

export const revalidate = 3600;

async function getRecipe(slug: string): Promise<Recipe | null> {
  try {
    const recipe = await getRecipeBySlug(slug);
    if (recipe) return recipe;
  } catch (error) {
    console.error("[recipes/[slug]] fetch failed:", error);
  }
  return fixtureRecipeBySlug(slug);
}

async function getPool(): Promise<Recipe[]> {
  try {
    return recipesOrFixtures(await getPublishedRecipes({ limit: 100 }));
  } catch {
    return recipesOrFixtures([]);
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const recipe = await getRecipe(slug);
  if (!recipe) return { title: "Recipe not found" };

  return {
    title: recipe.seo?.metaTitle || recipe.title,
    description: recipe.seo?.metaDescription || recipe.description || `${recipe.title}, from ${SITE_NAME}.`,
    alternates: { canonical: `/recipes/${recipe.slug}` },
    robots: recipe.sample ? { index: false, follow: false } : undefined,
    openGraph: {
      title: recipe.title,
      description: recipe.description,
      type: "article",
      siteName: SITE_NAME,
      url: `/recipes/${recipe.slug}`,
    },
  };
}

export async function generateStaticParams() {
  try {
    const slugs = await getAllRecipeSlugs();
    if (slugs.length > 0) return slugs.map((slug) => ({ slug }));
  } catch (error) {
    console.error("[recipes/[slug]] could not load slugs from Firestore:", error);
  }
  return recipesOrFixtures([]).map((r) => ({ slug: r.slug }));
}

export default async function RecipePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const recipe = await getRecipe(slug);
  if (!recipe) notFound();

  const [pool, comments] = await Promise.all([
    getPool(),
    recipe.sample
      ? Promise.resolve([])
      : getApprovedComments(recipe.slug).catch((error) => {
          console.error("[recipes/[slug]] comments fetch failed:", error);
          return [];
        }),
  ]);
  const related = moreLikeThis(recipe, pool, 3);

  const imageUrl = recipe.heroImage ? (recipe.heroImage.startsWith("http") ? recipe.heroImage : `${SITE_URL}${recipe.heroImage}`) : undefined;
  const jsonLd = recipe.sample
    ? null
    : {
        "@context": "https://schema.org",
        "@type": "Recipe",
        name: recipe.title,
        description: recipe.description || undefined,
        url: `${SITE_URL}/recipes/${recipe.slug}`,
        image: imageUrl,
        author: { "@type": "Person", name: AUTHOR_NAME },
        publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
        datePublished: recipe.publishedAt?.toISOString(),
        prepTime: isoDuration(recipe.prepTime),
        cookTime: isoDuration(recipe.cookTime),
        totalTime: isoDuration(totalMinutes(recipe)),
        recipeYield: jsonLdYield(recipe),
        recipeCategory: recipe.category[0] ? getCategoryLabel(recipe.category[0]) : undefined,
        keywords: recipe.tags.length ? recipe.tags.join(", ") : undefined,
        recipeIngredient: recipe.ingredients.map((i) => [i.amount, i.unit, i.name].filter(Boolean).join(" ")),
        recipeInstructions: recipe.instructions.map((i) => ({ "@type": "HowToStep", text: i.text })),
        nutrition: recipe.nutrition
          ? {
              "@type": "NutritionInformation",
              calories: recipe.nutrition.calories ? `${recipe.nutrition.calories} calories` : undefined,
              proteinContent: recipe.nutrition.protein ? `${recipe.nutrition.protein}g` : undefined,
              carbohydrateContent: recipe.nutrition.carbs ? `${recipe.nutrition.carbs}g` : undefined,
              fatContent: recipe.nutrition.fat ? `${recipe.nutrition.fat}g` : undefined,
            }
          : undefined,
        aggregateRating:
          recipe.rating.count >= MIN_RATINGS
            ? { "@type": "AggregateRating", ratingValue: recipe.rating.average, ratingCount: recipe.rating.count }
            : undefined,
      };

  return (
    <>
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}
      <RecipePageClient recipe={recipe} relatedRecipes={related} comments={comments} />
    </>
  );
}
