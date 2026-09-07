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
    <Suspense fallback={<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 min-h-[50vh]" />}>
      <LifestyleClient initialPosts={posts} />
    </Suspense>
  );
}
