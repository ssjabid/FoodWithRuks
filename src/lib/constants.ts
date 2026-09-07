export const NAV_ITEMS = [
  { label: "Recipes", href: "/recipes" },
  { label: "Lifestyle", href: "/lifestyle" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

export const RECIPE_CATEGORIES = [
  { value: "starters", label: "Starters" },
  { value: "mains", label: "Mains" },
  { value: "desserts", label: "Desserts" },
  { value: "snacks", label: "Snacks" },
  { value: "drinks", label: "Drinks" },
] as const;

export const MEAL_TYPES = [
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
  { value: "brunch", label: "Brunch" },
] as const;

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

export const LIFESTYLE_CATEGORIES = [
  "Kitchen Tips",
  "Food Culture",
  "Cooking Journey",
  "Behind the Scenes",
] as const;

export const SITE_NAME = "FoodWithRuks";
export const SITE_DESCRIPTION = "Delicious recipes crafted with love — from my kitchen to yours.";
export const SITE_URL = "https://foodwithruks.com";
