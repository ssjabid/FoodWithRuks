import type { Metadata } from "next";
import { Suspense } from "react";
import { LifestyleClient } from "./LifestyleClient";
import { getPublishedPosts } from "@/lib/firebase/lifestyle";
import { postsOrFixtures } from "@/lib/content";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Stories",
  description: "Days out, eating out, travel, parenting and the odd craft, from Ruks.",
  alternates: { canonical: "/lifestyle" },
};

export default async function LifestylePage() {
  let posts;
  try {
    posts = postsOrFixtures(await getPublishedPosts());
  } catch (error) {
    console.error("[lifestyle] Firestore fetch failed:", error);
    posts = postsOrFixtures([]);
  }

  return (
    <Suspense
      fallback={
        <div className="max-w-wide mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 min-h-[50vh]">
          <h1 className="h-page text-[var(--color-text)] mb-8">Stories</h1>
        </div>
      }
    >
      <LifestyleClient initialPosts={posts} />
    </Suspense>
  );
}
