import {
  RECIPE_CATEGORIES,
  MEAL_TYPES,
  LIFESTYLE_CATEGORIES,
  DIFFICULTY_OPTIONS,
  BADGES,
  isYieldKind,
  type RecipeCategory,
  type MealType,
  type LifestyleCategory,
  type BadgeId,
} from "@/lib/constants";
import { slugify } from "@/lib/utils";
import type { Ingredient, Instruction, Nutrition, Recipe, SEO, LifestylePost, YieldNoun, Oven, ExtraTime, Verdicts } from "@/types";

/**
 * Server-side normalisation for everything the admin can write. The forms
 * validate too, but the API is the boundary: unknown fields are dropped,
 * types are coerced, lengths are capped, enums are checked and protected
 * fields (rating, viewCount, timestamps) can never be set from a request.
 */

export class ValidationError extends Error {
  status = 400;
}

const fail = (msg: string): never => {
  throw new ValidationError(msg);
};

const str = (v: unknown, max: number, field: string, { required = false } = {}): string => {
  if (v === undefined || v === null) v = "";
  if (typeof v !== "string") fail(`${field} must be text.`);
  const s = (v as string).trim();
  if (required && !s) fail(`${field} is required.`);
  if (s.length > max) fail(`${field} is too long (max ${max} characters).`);
  return s;
};

const int = (v: unknown, field: string, { min = 0, max = 100000, fallback = 0 } = {}): number => {
  if (v === undefined || v === null || v === "") return fallback;
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) fail(`${field} must be a number.`);
  const r = Math.round(n);
  if (r < min || r > max) fail(`${field} must be between ${min} and ${max}.`);
  return r;
};

const strList = (v: unknown, field: string, { maxItems = 30, maxLen = 40 } = {}): string[] => {
  if (v === undefined || v === null) return [];
  if (!Array.isArray(v)) fail(`${field} must be a list.`);
  const out = (v as unknown[]).map((x) => str(x, maxLen, field)).filter(Boolean);
  if (out.length > maxItems) fail(`${field} has too many entries (max ${maxItems}).`);
  return Array.from(new Set(out));
};

const enumList = <T extends string>(v: unknown, allowed: readonly T[], field: string): T[] => {
  const list = strList(v, field, { maxItems: allowed.length, maxLen: 40 });
  for (const x of list) if (!(allowed as readonly string[]).includes(x)) fail(`${field}: unknown value "${x}".`);
  return list as T[];
};

const url = (v: unknown, field: string): string => {
  const s = str(v, 600, field);
  if (!s) return "";
  if (s.startsWith("/") || /^https?:\/\/\S+$/i.test(s)) return s;
  return fail(`${field} must be a link (https://...) or a site path.`);
};

export function normaliseSlug(raw: unknown, title: string): string {
  const s = slugify(typeof raw === "string" && raw.trim() ? raw : title).slice(0, 120);
  if (!s) fail("Slug is required.");
  if (!/^[a-z0-9-]+$/.test(s)) fail("Slug can only contain letters, numbers and hyphens.");
  return s;
}

const STATUSES = ["draft", "published"] as const;
const status = (v: unknown): "draft" | "published" =>
  (STATUSES as readonly string[]).includes(v as string) ? (v as "draft" | "published") : "draft";

/** Field limits shared with the admin form counters. */
export const LIMITS = {
  yieldNoun: 24,
  ruksNote: 120,
  verdict: 140,
  inspiredBy: 80,
  keeps: 140,
  alt: 160,
  extraTimeLabel: 24,
  extraTimeMinutes: 7200,
  ovenMin: 50,
  ovenMax: 300,
  heroNote: 80,
  currently: 60,
} as const;

/** A complete, safe recipe payload. Optional sections are undefined when empty (cleared on update). */
export type RecipeInput = Omit<Recipe, "id" | "createdAt" | "updatedAt" | "publishedAt" | "scheduledAt" | "rating" | "viewCount" | "sample">;

export function normaliseRecipeInput(body: unknown): RecipeInput {
  if (!body || typeof body !== "object") fail("Invalid request body.");
  const b = body as Record<string, unknown>;

  const title = str(b.title, 200, "Title", { required: true });
  const slug = normaliseSlug(b.slug, title);

  const category = enumList<RecipeCategory>(
    b.category,
    RECIPE_CATEGORIES.map((c) => c.value),
    "Category"
  );
  if (category.length === 0) fail("Choose at least one category.");

  const ingredientsRaw = Array.isArray(b.ingredients) ? (b.ingredients as unknown[]) : [];
  if (ingredientsRaw.length > 200) fail("Too many ingredients (max 200).");
  const ingredients: Ingredient[] = ingredientsRaw
    .map((x, i): Ingredient | null => {
      const o = (x && typeof x === "object" ? x : {}) as Record<string, unknown>;
      const name = str(o.name, 120, `Ingredient ${i + 1}`);
      if (!name) return null;
      return {
        id: str(o.id, 64, "Ingredient id") || `ing-${i + 1}`,
        amount: str(o.amount, 20, `Ingredient ${i + 1} amount`),
        unit: str(o.unit, 20, `Ingredient ${i + 1} unit`),
        name,
        group: str(o.group, 60, `Ingredient ${i + 1} group`) || undefined,
      };
    })
    .filter((x): x is Ingredient => x !== null);
  if (ingredients.length === 0) fail("Add at least one ingredient.");

  const instructionsRaw = Array.isArray(b.instructions) ? (b.instructions as unknown[]) : [];
  if (instructionsRaw.length > 100) fail("Too many steps (max 100).");
  const instructions: Instruction[] = instructionsRaw
    .map((x, i): Instruction | null => {
      const o = (x && typeof x === "object" ? x : {}) as Record<string, unknown>;
      const text = str(o.text, 3000, `Step ${i + 1}`);
      if (!text) return null;
      const image = url(o.image, `Step ${i + 1} photo`);
      const imageAlt = str(o.imageAlt, LIMITS.alt, `Step ${i + 1} photo description`);
      return { step: 0, text, ...(image ? { image } : {}), ...(image && imageAlt ? { imageAlt } : {}) };
    })
    .filter((x): x is Instruction => x !== null)
    .map((s, i) => ({ ...s, step: i + 1 }));
  if (instructions.length === 0) fail("Add at least one step.");

  const instagramUrl = url(b.instagramUrl, "Instagram link");
  if (instagramUrl && !/^https:\/\/(www\.)?instagram\.com\//i.test(instagramUrl)) fail("Instagram link must be an instagram.com address.");

  const n = (b.nutrition && typeof b.nutrition === "object" ? b.nutrition : {}) as Record<string, unknown>;
  const nutritionVals = {
    calories: int(n.calories, "Calories"),
    protein: int(n.protein, "Protein"),
    carbs: int(n.carbs, "Carbs"),
    fat: int(n.fat, "Fat"),
  };
  const nutrition: Nutrition | undefined = Object.values(nutritionVals).some((v) => v > 0) ? nutritionVals : undefined;

  const s = (b.seo && typeof b.seo === "object" ? b.seo : {}) as Record<string, unknown>;
  const seoVals = { metaTitle: str(s.metaTitle, 70, "Meta title"), metaDescription: str(s.metaDescription, 200, "Meta description") };
  const seo: SEO | undefined = seoVals.metaTitle || seoVals.metaDescription ? seoVals : undefined;

  const difficultyRaw = typeof b.difficulty === "string" ? b.difficulty : "medium";
  const difficulty = DIFFICULTY_OPTIONS.some((d) => d.value === difficultyRaw) ? (difficultyRaw as Recipe["difficulty"]) : "medium";

  // Yield: "Serves 4" or "Makes 12 cookies"
  const yieldKind = isYieldKind(b.yieldKind) ? b.yieldKind : "serves";
  const yn = (b.yieldNoun && typeof b.yieldNoun === "object" ? b.yieldNoun : {}) as Record<string, unknown>;
  const one = str(yn.one, LIMITS.yieldNoun, "What it makes (singular)");
  const other = str(yn.other, LIMITS.yieldNoun, "What it makes (plural)");
  const yieldNoun: YieldNoun | undefined = yieldKind === "makes" && (one || other) ? { one: one || other, other: other || one } : undefined;

  // Oven: null for no-bake
  let oven: Oven | null = null;
  if (b.oven && typeof b.oven === "object") {
    const o = b.oven as Record<string, unknown>;
    if (o.tempC !== undefined && o.tempC !== null && o.tempC !== "") {
      oven = { tempC: int(o.tempC, "Oven temperature", { min: LIMITS.ovenMin, max: LIMITS.ovenMax }), fan: o.fan === true };
    }
  }

  // Extra time: chilling, proving, setting, resting
  let extraTime: ExtraTime | null = null;
  if (b.extraTime && typeof b.extraTime === "object") {
    const e = b.extraTime as Record<string, unknown>;
    const minutes = int(e.minutes, "Extra time", { max: LIMITS.extraTimeMinutes });
    if (minutes > 0) extraTime = { minutes, label: str(e.label, LIMITS.extraTimeLabel, "Extra time label") || "resting" };
  }

  const v = (b.verdicts && typeof b.verdicts === "object" ? b.verdicts : {}) as Record<string, unknown>;
  const tasteTester = str(v.tasteTester, LIMITS.verdict, "The taste-tester's verdict");
  const agooh = str(v.agooh, LIMITS.verdict, "Agooh's verdict");
  const verdicts: Verdicts | undefined = tasteTester || agooh ? { ...(tasteTester ? { tasteTester } : {}), ...(agooh ? { agooh } : {}) } : undefined;

  return {
    title,
    slug,
    description: str(b.description, 1000, "Description"),
    personalStory: str(b.personalStory, 3000, "Story"),
    instagramUrl,
    category,
    mealType: enumList<MealType>(b.mealType, MEAL_TYPES.map((m) => m.value), "Meal type"),
    dietaryTags: strList(b.dietaryTags, "Dietary tags", { maxItems: 20, maxLen: 40 }),
    specialOccasion: strList(b.specialOccasion, "Occasion", { maxItems: 20, maxLen: 40 }),
    tags: strList(b.tags, "Tags", { maxItems: 30, maxLen: 30 }),
    difficulty,
    prepTime: int(b.prepTime, "Prep time", { max: 10000 }),
    cookTime: int(b.cookTime, "Cook time", { max: 10000 }),
    servings: int(b.servings, yieldKind === "makes" ? "Makes how many" : "Serves", { min: 1, max: 500, fallback: 4 }),
    yieldKind,
    yieldNoun,
    oven,
    extraTime,
    ruksNote: str(b.ruksNote, LIMITS.ruksNote, "Your note"),
    badges: enumList<BadgeId>(b.badges, BADGES.map((x) => x.id), "Charms"),
    verdicts,
    inspiredBy: str(b.inspiredBy, LIMITS.inspiredBy, "Inspired by"),
    keeps: str(b.keeps, LIMITS.keeps, "Keeps"),
    ingredients,
    instructions,
    heroImage: url(b.heroImage, "Hero photo"),
    heroImageAlt: str(b.heroImageAlt, LIMITS.alt, "Photo description"),
    tips: str(b.tips, 3000, "Tips"),
    nutrition,
    seo,
    status: status(b.status),
    featured: b.featured === true,
  };
}

export type PostInput = Omit<LifestylePost, "id" | "createdAt" | "updatedAt" | "publishedAt">;

export function readingTimeFromHtml(html: string): number {
  const words = html.replace(/<[^>]+>/g, " ").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function normalisePostInput(body: unknown): PostInput {
  if (!body || typeof body !== "object") fail("Invalid request body.");
  const b = body as Record<string, unknown>;

  const title = str(b.title, 200, "Title", { required: true });
  const slug = normaliseSlug(b.slug, title);
  const content = typeof b.content === "string" ? b.content : "";
  if (content.length > 100_000) fail("Content is too long.");
  if (!content.replace(/<[^>]+>/g, "").trim()) fail("Content is required.");

  const categoryRaw = typeof b.category === "string" ? b.category : "";
  if (!LIFESTYLE_CATEGORIES.some((c) => c.value === categoryRaw)) fail("Choose a category.");

  return {
    title,
    slug,
    excerpt: str(b.excerpt, 500, "Excerpt"),
    coverImage: url(b.coverImage, "Cover photo"),
    coverImageAlt: str(b.coverImageAlt, LIMITS.alt, "Cover photo description"),
    content,
    category: categoryRaw as LifestyleCategory,
    readingTime: readingTimeFromHtml(content),
    status: status(b.status),
  };
}

/** Currently card rows (admin Pages). */
export function normaliseCurrently(body: unknown): { baking: string; craving: string; lastWalk: string; latestParcel: string } {
  const c = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;
  return {
    baking: str(c.baking, LIMITS.currently, "Baking"),
    craving: str(c.craving, LIMITS.currently, "Craving"),
    lastWalk: str(c.lastWalk, LIMITS.currently, "Last walk"),
    latestParcel: str(c.latestParcel, LIMITS.currently, "Latest parcel"),
  };
}
