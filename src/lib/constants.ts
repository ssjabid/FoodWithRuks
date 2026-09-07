/* ————————————————————————
   RECIPE TAXONOMY
   ———————————————————————— */

export const RECIPE_CATEGORIES = [
  { value: "starters", label: "Starters", nav: true },
  { value: "mains", label: "Main Courses", nav: true },
  { value: "sides", label: "Side Dishes", nav: true },
  { value: "snacks", label: "Snacks", nav: false },
  { value: "desserts", label: "Desserts", nav: true },
  { value: "bread", label: "Bread", nav: true },
  { value: "drinks", label: "Drinks", nav: true },
  { value: "baby-weaning", label: "Baby Weaning", nav: true },
] as const;
export type RecipeCategory = (typeof RECIPE_CATEGORIES)[number]["value"];

export const MEAL_TYPES = [
  { value: "breakfast", label: "Breakfast" },
  { value: "brunch", label: "Brunch" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
] as const;
export type MealType = (typeof MEAL_TYPES)[number]["value"];

export const DIETARY_TAGS = [
  "Vegetarian",
  "Vegan",
  "Gluten-Free",
  "Halal",
  "Dairy-Free",
  "Keto",
] as const;

export const SPECIAL_OCCASIONS = [
  { value: "eid", label: "Eid" },
  { value: "ramadan", label: "Ramadan" },
  { value: "christmas", label: "Christmas" },
  { value: "date-night", label: "Date Night" },
  { value: "quick-weeknight", label: "Quick Weeknight" },
] as const;

export const DIFFICULTY_OPTIONS = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
] as const;

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Most Popular" },
  { value: "quickest", label: "Quickest" },
] as const;

export const UNIT_OPTIONS = [
  "cup", "cups", "tbsp", "tsp", "oz", "lb", "g", "kg", "ml", "l",
  "piece", "pieces", "whole", "pinch", "dash", "to taste", "handful",
  "bunch", "clove", "cloves", "slice", "slices", "can", "package",
] as const;

/* ————————————————————————
   LIFESTYLE TAXONOMY
   ———————————————————————— */

export const LIFESTYLE_CATEGORIES = [
  { value: "days-out", label: "Days Out" },
  { value: "eating-out", label: "Eating Out" },
  { value: "travel", label: "Travel" },
  { value: "parenting", label: "Parenting" },
  { value: "craft-hobbies", label: "Craft & Hobbies" },
] as const;
export type LifestyleCategory = (typeof LIFESTYLE_CATEGORIES)[number]["value"];

/* ————————————————————————
   "WHAT TO EAT?" QUICK-LINK BOXES
   Mixes recipe categories and meal types; each box knows which
   query param it drives on /recipes.
   ———————————————————————— */

export type WhatToEatIcon =
  | "starter" | "main" | "side" | "snack" | "breakfast"
  | "dinner" | "dessert" | "drink" | "bread" | "baby";

export type WhatToEatItem =
  | { key: string; label: string; icon: WhatToEatIcon; param: "category"; value: RecipeCategory }
  | { key: string; label: string; icon: WhatToEatIcon; param: "mealType"; value: MealType };

export const WHAT_TO_EAT: readonly WhatToEatItem[] = [
  { key: "starters", label: "Starters", icon: "starter", param: "category", value: "starters" },
  { key: "mains", label: "Main Course", icon: "main", param: "category", value: "mains" },
  { key: "sides", label: "Side Dishes", icon: "side", param: "category", value: "sides" },
  { key: "snacks", label: "Snacks", icon: "snack", param: "category", value: "snacks" },
  { key: "breakfast", label: "Breakfast", icon: "breakfast", param: "mealType", value: "breakfast" },
  { key: "dinner", label: "Dinner", icon: "dinner", param: "mealType", value: "dinner" },
  { key: "desserts", label: "Desserts", icon: "dessert", param: "category", value: "desserts" },
  { key: "drinks", label: "Drinks", icon: "drink", param: "category", value: "drinks" },
  { key: "bread", label: "Bread", icon: "bread", param: "category", value: "bread" },
  { key: "baby", label: "Baby Weaning", icon: "baby", param: "category", value: "baby-weaning" },
];

/* ————————————————————————
   NAVIGATION
   ———————————————————————— */

export interface NavChild { label: string; href: string }
export interface NavNode { label: string; href: string; children?: readonly NavChild[] }

export const NAV_TREE: readonly NavNode[] = [
  {
    label: "Recipes",
    href: "/recipes",
    children: RECIPE_CATEGORIES.filter((c) => c.nav).map((c) => ({
      label: c.label,
      href: `/recipes?category=${c.value}`,
    })),
  },
  {
    label: "Lifestyle",
    href: "/lifestyle",
    children: LIFESTYLE_CATEGORIES.map((c) => ({
      label: c.label,
      href: `/lifestyle?category=${c.value}`,
    })),
  },
  { label: "About Me", href: "/about" },
  { label: "Newsletter", href: "/newsletter" },
  { label: "Contact", href: "/contact" },
];

/** Flat top-level nav (footer, simple lists). */
export const NAV_ITEMS: readonly NavChild[] = NAV_TREE.map(({ label, href }) => ({ label, href }));

/* ————————————————————————
   HELPERS
   ———————————————————————— */

export function getCategoryLabel(value: string): string {
  return RECIPE_CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

export function getMealTypeLabel(value: string): string {
  return MEAL_TYPES.find((m) => m.value === value)?.label ?? value;
}

export function getLifestyleCategoryLabel(value: string): string {
  return LIFESTYLE_CATEGORIES.find((c) => c.value === value)?.label ?? value;
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

// Re-exported so existing imports keep working; canonical home is src/lib/site.ts
export { SITE_NAME, SITE_DESCRIPTION, SITE_URL } from "./site";

