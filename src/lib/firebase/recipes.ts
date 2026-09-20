import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "./admin";
import { getSiteSettings } from "./siteSettings";
import type { Recipe } from "@/types";
import type { RecipeCategory, MealType } from "@/lib/constants";

function docToRecipe(doc: FirebaseFirestore.QueryDocumentSnapshot): Recipe {
  const data = doc.data();
  return {
    id: doc.id,
    title: data.title,
    slug: data.slug,
    description: data.description,
    personalStory: data.personalStory || "",
    instagramUrl: data.instagramUrl || "",
    category: (data.category || []) as RecipeCategory[],
    tags: data.tags || [],
    dietaryTags: data.dietaryTags || [],
    mealType: (data.mealType || []) as MealType[],
    specialOccasion: data.specialOccasion || [],
    prepTime: data.prepTime || 0,
    cookTime: data.cookTime || 0,
    servings: data.servings || 4,
    difficulty: data.difficulty || "medium",
    ingredients: data.ingredients || [],
    instructions: data.instructions || [],
    heroImage: data.heroImage || "",
    tips: data.tips || "",
    nutrition: data.nutrition || undefined,
    seo: data.seo || undefined,
    status: data.status || "draft",
    featured: data.featured || false,
    rating: data.rating || { average: 0, count: 0 },
    viewCount: data.viewCount || 0,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
    publishedAt: data.publishedAt?.toDate() || undefined,
    scheduledAt: data.scheduledAt?.toDate() || undefined,
  };
}

export async function getPublishedRecipes(options?: {
  limit?: number;
  category?: string;
  sortBy?: "newest" | "popular" | "quickest";
}): Promise<Recipe[]> {
  const { limit = 20, category, sortBy = "newest" } = options || {};

  let query = adminDb
    .collection("recipes")
    .where("status", "==", "published") as FirebaseFirestore.Query;

  if (category) {
    query = query.where("category", "array-contains", category);
  }

  switch (sortBy) {
    case "popular":
      query = query.orderBy("viewCount", "desc");
      break;
    case "quickest":
      query = query.orderBy("cookTime", "asc");
      break;
    default:
      query = query.orderBy("publishedAt", "desc");
  }

  query = query.limit(limit);

  const snapshot = await query.get();
  return snapshot.docs.map(docToRecipe);
}

export async function getFeaturedRecipes(limit = 4): Promise<Recipe[]> {
  const snapshot = await adminDb
    .collection("recipes")
    .where("status", "==", "published")
    .where("featured", "==", true)
    .orderBy("publishedAt", "desc")
    .limit(limit)
    .get();

  return snapshot.docs.map(docToRecipe);
}

export async function getRecipeBySlug(slug: string): Promise<Recipe | null> {
  const snapshot = await adminDb
    .collection("recipes")
    .where("slug", "==", slug)
    .where("status", "==", "published")
    .limit(1)
    .get();

  if (snapshot.empty) return null;
  return docToRecipe(snapshot.docs[0]);
}

/** Any status — for signed draft previews only. */
export async function getRecipeBySlugAnyStatus(slug: string): Promise<Recipe | null> {
  const snapshot = await adminDb.collection("recipes").where("slug", "==", slug).limit(1).get();
  if (snapshot.empty) return null;
  return docToRecipe(snapshot.docs[0]);
}

/** True when another document already uses this slug. */
export async function recipeSlugExists(slug: string, excludeId?: string): Promise<boolean> {
  const snapshot = await adminDb.collection("recipes").where("slug", "==", slug).limit(2).get();
  return snapshot.docs.some((d) => d.id !== excludeId);
}

/** +1 view on a published recipe (no-op when the slug is unknown). */
export async function incrementRecipeViews(slug: string): Promise<void> {
  const snapshot = await adminDb.collection("recipes").where("slug", "==", slug).where("status", "==", "published").limit(1).get();
  if (snapshot.empty) return;
  await snapshot.docs[0].ref.update({ viewCount: FieldValue.increment(1) });
}

/** Recompute rating.average / rating.count from approved comments. */
export async function recomputeRecipeRating(recipeId: string): Promise<{ average: number; count: number }> {
  const snapshot = await adminDb.collection("comments").where("recipeId", "==", recipeId).where("status", "==", "approved").get();
  const ratings = snapshot.docs.map((d) => Number(d.data().rating)).filter((n) => Number.isFinite(n) && n >= 1 && n <= 5);
  const count = ratings.length;
  const average = count ? Math.round((ratings.reduce((a, b) => a + b, 0) / count) * 10) / 10 : 0;
  const ref = adminDb.collection("recipes").doc(recipeId);
  if ((await ref.get()).exists) await ref.update({ rating: { average, count } });
  return { average, count };
}

export async function getRelatedRecipes(recipe: Recipe, limit = 4): Promise<Recipe[]> {
  if (recipe.category.length === 0) return [];

  const snapshot = await adminDb
    .collection("recipes")
    .where("status", "==", "published")
    .where("category", "array-contains-any", recipe.category)
    .orderBy("publishedAt", "desc")
    .limit(limit + 1)
    .get();

  return snapshot.docs
    .map(docToRecipe)
    .filter((r) => r.slug !== recipe.slug)
    .slice(0, limit);
}

/**
 * The pinned "New Recipe of the Week" (siteSettings/general.recipeOfTheWeekSlug),
 * falling back to the most recently published recipe.
 */
export async function getRecipeOfTheWeek(): Promise<Recipe | null> {
  const settings = await getSiteSettings();
  if (settings.recipeOfTheWeekSlug) {
    const pinned = await getRecipeBySlug(settings.recipeOfTheWeekSlug);
    if (pinned) return pinned;
  }
  const [latest] = await getPublishedRecipes({ limit: 1 });
  return latest ?? null;
}

export async function getAllRecipeSlugs(): Promise<string[]> {
  const snapshot = await adminDb
    .collection("recipes")
    .where("status", "==", "published")
    .select("slug")
    .get();

  return snapshot.docs.map((doc) => doc.data().slug);
}

/** Slug + updatedAt for every published document — used by sitemap.xml. */
export async function getRecipeSitemapEntries(): Promise<{ slug: string; updatedAt: Date }[]> {
  const snapshot = await adminDb
    .collection("recipes")
    .where("status", "==", "published")
    .select("slug", "updatedAt")
    .get();

  return snapshot.docs.map((doc) => ({
    slug: doc.data().slug as string,
    updatedAt: doc.data().updatedAt?.toDate?.() ?? new Date(),
  }));
}

// Admin CRUD functions

export async function getAllRecipes(): Promise<Recipe[]> {
  const snapshot = await adminDb
    .collection("recipes")
    .orderBy("updatedAt", "desc")
    .get();

  return snapshot.docs.map(docToRecipe);
}

export async function getRecipeById(id: string): Promise<Recipe | null> {
  const doc = await adminDb.collection("recipes").doc(id).get();
  if (!doc.exists) return null;
  return { ...docToRecipe(doc as FirebaseFirestore.QueryDocumentSnapshot) };
}

type RecipeWrite = Omit<Recipe, "id" | "createdAt" | "updatedAt" | "publishedAt" | "scheduledAt" | "rating" | "viewCount"> &
  Partial<Pick<Recipe, "rating" | "viewCount">>;

export async function createRecipe(data: RecipeWrite): Promise<string> {
  const now = new Date();
  const docData = {
    ...data,
    createdAt: now,
    updatedAt: now,
    publishedAt: data.status === "published" ? now : null,
    rating: data.rating || { average: 0, count: 0 },
    viewCount: data.viewCount || 0,
  };
  const ref = await adminDb.collection("recipes").add(docData);
  return ref.id;
}

export async function updateRecipe(id: string, data: Partial<RecipeWrite>): Promise<void> {
  const updateData: Record<string, unknown> = { ...data, updatedAt: new Date() };
  // Optional sections sent as undefined are removed from the document
  for (const key of ["nutrition", "seo"] as const) {
    if (key in data && data[key] === undefined) updateData[key] = FieldValue.delete();
  }

  if (data.status === "published") {
    const existing = await adminDb.collection("recipes").doc(id).get();
    if (existing.exists && existing.data()?.status !== "published") {
      updateData.publishedAt = new Date();
    }
  }

  delete updateData.id;
  await adminDb.collection("recipes").doc(id).update(updateData);
}

export async function deleteRecipe(id: string): Promise<void> {
  await adminDb.collection("recipes").doc(id).delete();
}
