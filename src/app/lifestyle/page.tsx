import type { Metadata } from "next";
import { Suspense } from "react";
import { LifestyleClient } from "./LifestyleClient";
import { getPublishedPosts } from "@/lib/firebase/lifestyle";
import { SAMPLE_LIFESTYLE_POSTS } from "@/lib/sampleData";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Lifestyle",
  description: "Days out, eating out, travel, parenting and crafts — life beyond the kitchen with Agooh & Ruks.",
};

export default async function LifestylePage() {
  let posts;
  try {
    posts = await getPublishedPosts();
    if (posts.length === 0) posts = SAMPLE_LIFESTYLE_POSTS;
  } catch (error) {
    console.error("[lifestyle] Firestore fetch failed, using sample data:", error);
    posts = SAMPLE_LIFESTYLE_POSTS;
  }

  return (
    <Suspense
      fallback={
        <div className="max-w-wide mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 min-h-[50vh]">
          <p className="eyebrow mb-2">Lifestyle</p>
          <h1 className="h-page text-[var(--color-text-primary)] mb-2">Beyond the kitchen</h1>
        </div>
      }
    >
      <LifestyleClient initialPosts={posts} />
    </Suspense>
  );
}
