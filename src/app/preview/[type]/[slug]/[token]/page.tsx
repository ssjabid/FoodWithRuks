import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { verifyPreviewToken } from "@/lib/previewToken";
import { getRecipeBySlugAnyStatus } from "@/lib/firebase/recipes";
import { getPostBySlugAnyStatus } from "@/lib/firebase/lifestyle";
import { RecipePageClient } from "@/app/recipes/[slug]/RecipePageClient";
import { LifestylePostClient } from "@/app/lifestyle/[slug]/LifestylePostClient";

/** Signed draft preview. Never cached, never indexed. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Draft preview",
  robots: { index: false, follow: false },
};

interface Props {
  params: Promise<{ type: string; slug: string; token: string }>;
}

export default async function PreviewPage({ params }: Props) {
  const { type, slug: rawSlug, token } = await params;
  const slug = decodeURIComponent(rawSlug);
  if ((type !== "recipe" && type !== "post") || !verifyPreviewToken(type, slug, token)) notFound();

  const banner = (label: string) => (
    <div className="bg-[var(--color-warning)] text-[var(--color-text-primary)]">
      <div className="max-w-wide mx-auto px-4 sm:px-6 lg:px-8 py-2 text-sm font-medium">
        Draft preview: this {label} is not published. Only people with this link can see it.
      </div>
    </div>
  );

  if (type === "recipe") {
    const recipe = await getRecipeBySlugAnyStatus(slug);
    if (!recipe) notFound();
    return (
      <>
        {banner("recipe")}
        <RecipePageClient recipe={recipe} relatedRecipes={[]} comments={[]} preview />
      </>
    );
  }

  const post = await getPostBySlugAnyStatus(slug);
  if (!post) notFound();
  return (
    <>
      {banner("story")}
      <LifestylePostClient post={post} relatedPosts={[]} />
    </>
  );
}
