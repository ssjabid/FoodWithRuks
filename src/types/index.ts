export interface Recipe {
  id: string;
  title: string;
  slug: string;
  description: string;
  personalStory: string;
  instagramUrl?: string;
  category: string[];
  tags: string[];
  dietaryTags: string[];
  mealType: string[];
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

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  order: number;
  recipeCount: number;
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
  siteName: string;
  tagline: string;
  aboutText: string;
  aboutImage: string;
  socialLinks: {
    instagram?: string;
    pinterest?: string;
    tiktok?: string;
    youtube?: string;
  };
  newsletterEnabled: boolean;
  heroImage: string;
  heroTagline: string;
  instagramPostUrls: string[];
}

export interface LifestylePost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  readingTime: number;
  status: "draft" | "published";
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date;
}
