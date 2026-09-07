import { HeroSection } from "@/components/home/HeroSection";
import { FeaturedRecipes } from "@/components/home/FeaturedRecipes";
import { CategoriesSection } from "@/components/home/CategoriesSection";
import { AboutSnippet } from "@/components/home/AboutSnippet";
import { LifestyleTeaser } from "@/components/home/LifestyleTeaser";
import { NewsletterSection } from "@/components/home/NewsletterSection";
import { getFeaturedRecipes } from "@/lib/firebase/recipes";
import { SAMPLE_RECIPES } from "@/lib/sampleData";

export default async function HomePage() {
  let featured;
  try {
    featured = await getFeaturedRecipes(3);
    if (featured.length === 0) featured = SAMPLE_RECIPES.filter((r) => r.featured).slice(0, 3);
  } catch {
    featured = SAMPLE_RECIPES.filter((r) => r.featured).slice(0, 3);
  }

  return (
    <>
      <HeroSection />
      <FeaturedRecipes recipes={featured} />
      <CategoriesSection />
      <AboutSnippet />
      <LifestyleTeaser />
      <NewsletterSection />
    </>
  );
}
