import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPostBySlug, getPublishedPosts, getAllPostSlugs } from "@/lib/firebase/lifestyle";
import { fixturePostBySlug, postsOrFixtures } from "@/lib/content";
import { LifestylePostClient } from "./LifestylePostClient";
import type { LifestylePost } from "@/types";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getPost(slug: string): Promise<LifestylePost | null> {
  try {
    const post = await getPostBySlug(slug);
    if (post) return post;
  } catch (error) {
    console.error("[lifestyle/[slug]] fetch failed:", error);
  }
  return fixturePostBySlug(slug);
}

export async function generateStaticParams() {
  try {
    const slugs = await getAllPostSlugs();
    if (slugs.length > 0) return slugs.map((slug) => ({ slug }));
  } catch (error) {
    console.error("[lifestyle/[slug]] could not load slugs from Firestore:", error);
  }
  return postsOrFixtures([]).map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Story not found" };
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/lifestyle/${post.slug}` },
    openGraph: { title: post.title, description: post.excerpt, type: "article", url: `/lifestyle/${post.slug}` },
  };
}

export default async function LifestylePostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  let related: LifestylePost[] = [];
  try {
    const all = postsOrFixtures(await getPublishedPosts()).filter((p) => p.slug !== slug);
    related = [...all.filter((p) => p.category === post.category), ...all.filter((p) => p.category !== post.category)].slice(0, 3);
  } catch {
    related = postsOrFixtures([])
      .filter((p) => p.slug !== slug)
      .slice(0, 3);
  }

  return <LifestylePostClient post={post} relatedPosts={related} />;
}
