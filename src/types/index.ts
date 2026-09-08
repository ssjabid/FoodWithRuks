import type { RecipeCategory, MealType, LifestyleCategory } from "@/lib/constants";
import type { PaletteId } from "@/lib/theme";

export interface Recipe {
  id: string;
  title: string;
  slug: string;
  description: string;
  personalStory: string;
  instagramUrl?: string;
  category: RecipeCategory[];
  tags: string[];
  dietaryTags: string[];
  mealType: MealType[];
  specialOccasion: string[];
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: "easy" | "medium" | "hard";
  ingredients: Ingredient[];
  instructions: Instruction[];
  heroImage: string;
  tips: string;
  nutrition?: Nutrition;
  seo?: SEO;
  status: "draft" | "published";
  featured: boolean;
  rating: { average: number; count: number };
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  scheduledAt?: Date;
}

export interface Ingredient {
  id: string;
  amount: string;
  unit: string;
  name: string;
  group?: string;
}

export interface Instruction {
  step: number;
  text: string;
  image?: string;
}

export interface Nutrition {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

export interface SEO {
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
}

export interface Comment {
  id: string;
  recipeId: string;
  recipeSlug: string;
  text: string;
  rating: number;
  status: "pending" | "approved";
  createdAt: Date;
  ipHash: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

export interface SiteSettings {
  /** Slug of the recipe pinned as "New Recipe of the Week"; empty = latest published. */
  recipeOfTheWeekSlug: string;
  instagramHandle: string;
  /** Site-wide default palette (visitors can override in the drawer). */
  defaultPalette: PaletteId;
  /** Whether the Appearance picker is shown to visitors. */
  showThemePicker: boolean;
  updatedAt?: Date;
}

export type SubscriberSource = "home" | "footer" | "newsletter-page";

export interface Subscriber {
  id: string;
  email: string;
  source: SubscriberSource;
  status: "subscribed" | "unsubscribed";
  createdAt: Date;
}

export interface LifestylePost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: LifestyleCategory;
  readingTime: number;
  status: "draft" | "published";
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date;
}
