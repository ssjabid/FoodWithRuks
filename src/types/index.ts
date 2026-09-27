import type { RecipeCategory, MealType, LifestyleCategory, BadgeId, YieldKind } from "@/lib/constants";

/* Every field added by the redesign is optional and gets a default when read
   (docToRecipe and friends), so older documents keep working without a migration. */

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
  /** The number: serves 4, or makes 12 */
  servings: number;
  /** "Serves 4" or "Makes 12 cookies" */
  yieldKind: YieldKind;
  /** What it makes: { one: "cookie", other: "cookies" } */
  yieldNoun?: YieldNoun;
  /** Chilling, proving, setting, resting: shown up front ("plus overnight chilling") */
  extraTime?: ExtraTime | null;
  /** Oven setting as she uses it; null / undefined for no-bake */
  oven?: Oven | null;
  /** Her handwritten line by the title ("third time lucky") */
  ruksNote?: string;
  badges: BadgeId[];
  verdicts?: Verdicts;
  /** "Inspired by a holiday breakfast." */
  inspiredBy?: string;
  /** "Keeps three days in a tin." */
  keeps?: string;
  difficulty: "easy" | "medium" | "hard";
  ingredients: Ingredient[];
  instructions: Instruction[];
  heroImage: string;
  heroImageAlt?: string;
  tips: string;
  nutrition?: Nutrition;
  seo?: SEO;
  status: "draft" | "published";
  featured: boolean;
  rating: { average: number; count: number };
  viewCount: number;
  /** Development fixture, never real content */
  sample?: boolean;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  scheduledAt?: Date;
}

export interface YieldNoun {
  one: string;
  other: string;
}

export interface ExtraTime {
  minutes: number;
  /** "chilling", "proving", "setting", "resting" (24 chars max) */
  label: string;
}

export interface Oven {
  tempC: number;
  fan: boolean;
}

export interface Verdicts {
  tasteTester?: string;
  agooh?: string;
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
  imageAlt?: string;
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
  /** Reader's display name (older comments may not have one) */
  name: string;
  text: string;
  rating: number;
  status: "pending" | "approved";
  createdAt: Date;
  ipHash: string;
}

/** Approved comment as sent to the public recipe page (serialisable). */
export interface PublicComment {
  id: string;
  name: string;
  text: string;
  rating: number;
  /** ISO date */
  createdAt: string;
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
  /** Slug of the recipe pinned as the Offering on the home page; empty = newest published. */
  recipeOfTheWeekSlug: string;
  instagramHandle: string;
  /** Handwritten line on the Offering; falls back to the recipe's ruksNote */
  heroNote: string;
  /** Collection slug the home page leads with (e.g. a seasonal one); empty = none */
  activeCollection: string;
  /** The hidden Someday bakery page */
  showBakery: boolean;
  updatedAt?: Date;
}

export type SubscriberSource = "home" | "footer" | "newsletter-page" | "bakery";

export interface Subscriber {
  id: string;
  email: string;
  source: SubscriberSource;
  status: "subscribed" | "unsubscribed";
  createdAt: Date;
}

/** The Currently card: four short lines she updates from her phone. Empty rows hide. */
export interface Currently {
  baking: string;
  craving: string;
  lastWalk: string;
  latestParcel: string;
  updatedAt?: Date;
}

/** Editable copy for the fixed pages (siteSettings/pages). */
export interface PageContent {
  heroIntro: string;
  footerBlurb: string;
  aboutTitle: string;
  aboutSubtitle: string;
  /** HTML from the editor */
  aboutBody: string;
  aboutPhoto: string;
  aboutPhotoAlt: string;
  currently: Currently;
  updatedAt?: Date;
}

export interface LifestylePost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  /** Cover photo URL (uploaded or pasted); empty = placeholder */
  coverImage?: string;
  coverImageAlt?: string;
  category: LifestyleCategory;
  readingTime: number;
  status: "draft" | "published";
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date;
}
