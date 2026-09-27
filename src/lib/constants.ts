/* ------------------------------------------------------------------
   RECIPE TAXONOMY: bakes first. Every existing value is kept (documents
   store them); new bake categories added; labels in sentence case.
   ------------------------------------------------------------------ */

export const CATEGORY_GROUPS = [
  { value: "bakes", label: "Bakes", href: "/bakes" },
  { value: "cooking", label: "Cooking", href: "/cooking" },
  { value: "little-ones", label: "Little ones", href: "/recipes?group=little-ones" },
] as const;
export type CategoryGroup = (typeof CATEGORY_GROUPS)[number]["value"];

export const RECIPE_CATEGORIES = [
  { value: "cookies-biscuits", label: "Cookies and biscuits", group: "bakes" },
  { value: "brownies-traybakes", label: "Brownies and traybakes", group: "bakes" },
  { value: "cakes", label: "Cakes", group: "bakes" },
  { value: "cheesecakes", label: "Cheesecakes", group: "bakes" },
  { value: "pastries-tarts", label: "Pastries and tarts", group: "bakes" },
  { value: "pancakes-breakfast", label: "Pancakes and breakfast", group: "bakes" },
  { value: "bread", label: "Bread", group: "bakes" },
  { value: "desserts", label: "Puddings", group: "bakes" },
  { value: "starters", label: "Starters", group: "cooking" },
  { value: "mains", label: "Mains", group: "cooking" },
  { value: "sides", label: "Sides", group: "cooking" },
  { value: "snacks", label: "Snacks", group: "cooking" },
  { value: "drinks", label: "Drinks", group: "cooking" },
  { value: "baby-weaning", label: "Little ones", group: "little-ones" },
] as const;
export type RecipeCategory = (typeof RECIPE_CATEGORIES)[number]["value"];

export const MEAL_TYPES = [
  { value: "breakfast", label: "Breakfast" },
  { value: "brunch", label: "Brunch" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
] as const;
export type MealType = (typeof MEAL_TYPES)[number]["value"];

/** Free-text tags stored on the document. Halal is the baseline here, not a badge. */
export const DIETARY_TAGS = ["Vegetarian", "Vegan", "Gluten-free", "Dairy-free", "Nut-free", "Egg-free"] as const;

export const SPECIAL_OCCASIONS = [
  { value: "eid", label: "Eid" },
  { value: "ramadan", label: "Ramadan" },
  { value: "christmas", label: "Christmas" },
  { value: "date-night", label: "Date night" },
  { value: "quick-weeknight", label: "Quick weeknight" },
] as const;

export const DIFFICULTY_OPTIONS = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
] as const;

/** Public sort options (quickest = prep + cook). */
export const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "quickest", label: "Quickest" },
] as const;

export const UNIT_OPTIONS = [
  "g", "kg", "ml", "l", "tsp", "tbsp", "cup", "cups",
  "piece", "pieces", "whole", "pinch", "handful", "clove", "cloves",
  "slice", "slices", "tin", "sheet", "sheets", "to taste",
] as const;

export const YIELD_KINDS = [
  { value: "serves", label: "Serves" },
  { value: "makes", label: "Makes" },
] as const;
export type YieldKind = (typeof YIELD_KINDS)[number]["value"];

/* ------------------------------------------------------------------
   BADGES (charms). Each drives a collection.
   ------------------------------------------------------------------ */

export const BADGES = [
  { id: "first-try", label: "First try", blurb: "Her first go at it, published honestly.", collection: "first-tries" },
  { id: "travels-well", label: "Travels well", blurb: "Posts, packs and survives a car journey.", collection: "care-packages" },
  { id: "little-helpers", label: "Little helpers", blurb: "Good to make with a small child.", collection: "little-helpers" },
  { id: "trail-tested", label: "Trail-tested", blurb: "Survives a rucksack.", collection: "trail-tested" },
  { id: "make-ahead", label: "Make ahead", blurb: "Better the next day, or freezes well.", collection: "make-ahead" },
  { id: "taste-testers-pick", label: "Taste-tester's pick", blurb: "The taste-tester's favourites.", collection: "taste-testers-picks" },
] as const;
export type BadgeId = (typeof BADGES)[number]["id"];

/* ------------------------------------------------------------------
   STORIES (the existing lifestyle section, relabelled)
   ------------------------------------------------------------------ */

export const LIFESTYLE_CATEGORIES = [
  { value: "days-out", label: "Days out" },
  { value: "eating-out", label: "Eating out" },
  { value: "travel", label: "Travel" },
  { value: "parenting", label: "Parenting" },
  { value: "craft-hobbies", label: "Craft and hobbies" },
] as const;
export type LifestyleCategory = (typeof LIFESTYLE_CATEGORIES)[number]["value"];

/* ------------------------------------------------------------------
   NAVIGATION: Bakes, Cooking, Stories, About
   ------------------------------------------------------------------ */

export interface NavItem {
  label: string;
  href: string;
  /** Hidden while there is nothing published behind it */
  hideWhenEmpty?: "cooking";
}

export const NAV_ITEMS: readonly NavItem[] = [
  { label: "Bakes", href: "/bakes" },
  { label: "Cooking", href: "/cooking", hideWhenEmpty: "cooking" },
  { label: "Stories", href: "/lifestyle" },
  { label: "About", href: "/about" },
];

export const FOOTER_LINKS: readonly NavItem[] = [
  ...NAV_ITEMS,
  { label: "Say hello", href: "/contact" },
  { label: "New bakes by email", href: "/newsletter" },
  { label: "Privacy", href: "/privacy" },
];

/* ------------------------------------------------------------------
   HELPERS
   ------------------------------------------------------------------ */

export function getCategoryLabel(value: string): string {
  return RECIPE_CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

export function getCategoryGroup(value: string): CategoryGroup | undefined {
  return RECIPE_CATEGORIES.find((c) => c.value === value)?.group;
}

export function categoriesInGroup(group: CategoryGroup) {
  return RECIPE_CATEGORIES.filter((c) => c.group === group);
}

export function getGroupLabel(value: string): string {
  return CATEGORY_GROUPS.find((g) => g.value === value)?.label ?? value;
}

export function isCategoryGroup(value: string): value is CategoryGroup {
  return CATEGORY_GROUPS.some((g) => g.value === value);
}

export function getMealTypeLabel(value: string): string {
  return MEAL_TYPES.find((m) => m.value === value)?.label ?? value;
}

export function getLifestyleCategoryLabel(value: string): string {
  return LIFESTYLE_CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

export function getBadge(id: string) {
  return BADGES.find((b) => b.id === id);
}

export function isRecipeCategory(value: string): value is RecipeCategory {
  return RECIPE_CATEGORIES.some((c) => c.value === value);
}

export function isMealType(value: string): value is MealType {
  return MEAL_TYPES.some((m) => m.value === value);
}

export function isLifestyleCategory(value: string): value is LifestyleCategory {
  return LIFESTYLE_CATEGORIES.some((c) => c.value === value);
}

export function isBadgeId(value: string): value is BadgeId {
  return BADGES.some((b) => b.id === value);
}

export function isYieldKind(value: unknown): value is YieldKind {
  return value === "serves" || value === "makes";
}

// Re-exported so existing imports keep working; canonical home is src/lib/site.ts
export { SITE_NAME, SITE_DESCRIPTION, SITE_URL } from "./site";
