import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getRecipeBySlug, getRelatedRecipes, getAllRecipeSlugs } from "@/lib/firebase/recipes";
import { SAMPLE_RECIPES } from "@/lib/sampleData";
import { SITE_NAME, AUTHOR_NAME, SITE_URL } from "@/lib/site";
import { getCategoryLabel } from "@/lib/constants";
import { RecipePageClient } from "./RecipePageClient";
import type { Recipe } from "@/types";

export const revalidate = 3600;

async function getRecipe(slug: string): Promise<Recipe | null> {
  try {
    const recipe = await getRecipeBySlug(slug);
    if (recipe) return recipe;
  } catch {
    // fall through to sample data
  }
  return SAMPLE_RECIPES.find((r) => r.slug === slug) || null;
}

async function getRelated(recipe: Recipe): Promise<Recipe[]> {
  try {
    const related = await getRelatedRecipes(recipe, 3);
    if (related.length > 0) return related;
  } catch {
    // fall through
  }
  return SAMPLE_RECIPES.filter((r) => r.slug !== recipe.slug).slice(0, 3);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const recipe = await getRecipe(slug);
  if (!recipe) return { title: "Recipe Not Found" };

  return {
    title: recipe.seo?.metaTitle || recipe.title,
    description: recipe.seo?.metaDescription || recipe.description,
    alternates: { canonical: `/recipes/${recipe.slug}` },
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
    console.error("[recipes/[slug]] could not load slugs from Firestore, using sample data:", error);
  }
  return SAMPLE_RECIPES.map((r) => ({ slug: r.slug }));
}

export default async function RecipePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const recipe = await getRecipe(slug);
  if (!recipe) notFound();

  const relatedRecipes = await getRelated(recipe);

  // Schema.org JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: recipe.title,
    description: recipe.description,
    url: `${SITE_URL}/recipes/${recipe.slug}`,
    image: recipe.heroImage || undefined,
    author: { "@type": "Person", name: AUTHOR_NAME },
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    datePublished: recipe.publishedAt?.toISOString(),
    prepTime: `PT${recipe.prepTime}M`,
    cookTime: `PT${recipe.cookTime}M`,
    totalTime: `PT${recipe.prepTime + recipe.cookTime}M`,
    recipeYield: `${recipe.servings} servings`,
    recipeCategory: recipe.category[0] ? getCategoryLabel(recipe.category[0]) : "",
    keywords: recipe.tags.join(", "),
    recipeIngredient: recipe.ingredients.map((i) => `${i.amount} ${i.unit} ${i.name}`),
    recipeInstructions: recipe.instructions.map((i) => ({
      "@type": "HowToStep",
      text: i.text,
    })),
    nutrition: recipe.nutrition ? {
      "@type": "NutritionInformation",
      calories: recipe.nutrition.calories ? `${recipe.nutrition.calories} calories` : undefined,
      proteinContent: recipe.nutrition.protein ? `${recipe.nutrition.protein}g` : undefined,
      carbohydrateContent: recipe.nutrition.carbs ? `${recipe.nutrition.carbs}g` : undefined,
      fatContent: recipe.nutrition.fat ? `${recipe.nutrition.fat}g` : undefined,
    } : undefined,
    aggregateRating: recipe.rating.count > 0 ? {
      "@type": "AggregateRating",
      ratingValue: recipe.rating.average,
      ratingCount: recipe.rating.count,
    } : undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <RecipePageClient recipe={recipe} relatedRecipes={relatedRecipes} />
    </>
  );
}
