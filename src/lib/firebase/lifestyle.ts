import { adminDb } from "./admin";
import type { LifestylePost } from "@/types";
import type { LifestyleCategory } from "@/lib/constants";

function docToPost(doc: FirebaseFirestore.QueryDocumentSnapshot): LifestylePost {
  const data = doc.data();
  return {
    id: doc.id,
    title: data.title,
    slug: data.slug,
    excerpt: data.excerpt || "",
    content: data.content || "",
    category: (data.category || "") as LifestyleCategory,
    readingTime: data.readingTime || 0,
    status: data.status || "draft",
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
    publishedAt: data.publishedAt?.toDate() || new Date(),
  };
}

export async function getPublishedPosts(): Promise<LifestylePost[]> {
  const snapshot = await adminDb
    .collection("lifestylePosts")
    .where("status", "==", "published")
    .orderBy("publishedAt", "desc")
    .get();

  return snapshot.docs.map(docToPost);
}

export async function getPostBySlug(slug: string): Promise<LifestylePost | null> {
  const snapshot = await adminDb
    .collection("lifestylePosts")
    .where("slug", "==", slug)
    .where("status", "==", "published")
    .limit(1)
    .get();

  if (snapshot.empty) return null;
  return docToPost(snapshot.docs[0]);
}

export async function getAllPostSlugs(): Promise<string[]> {
  const snapshot = await adminDb
    .collection("lifestylePosts")
    .where("status", "==", "published")
    .select("slug")
    .get();

  return snapshot.docs.map((doc) => doc.data().slug);
}

// Admin CRUD

export async function getAllPosts(): Promise<LifestylePost[]> {
  const snapshot = await adminDb
    .collection("lifestylePosts")
    .orderBy("updatedAt", "desc")
    .get();

  return snapshot.docs.map(docToPost);
}

export async function getPostById(id: string): Promise<LifestylePost | null> {
  const doc = await adminDb.collection("lifestylePosts").doc(id).get();
  if (!doc.exists) return null;
  return docToPost(doc as FirebaseFirestore.QueryDocumentSnapshot);
}

export async function createPost(data: Omit<LifestylePost, "id" | "createdAt" | "updatedAt">): Promise<string> {
  const now = new Date();
  const docData = {
    ...data,
    createdAt: now,
    updatedAt: now,
    publishedAt: data.status === "published" ? now : data.publishedAt || null,
  };
  const ref = await adminDb.collection("lifestylePosts").add(docData);
  return ref.id;
}

export async function updatePost(id: string, data: Partial<LifestylePost>): Promise<void> {
  const updateData: Record<string, unknown> = { ...data, updatedAt: new Date() };

  if (data.status === "published") {
    const existing = await adminDb.collection("lifestylePosts").doc(id).get();
    if (existing.exists && existing.data()?.status !== "published") {
      updateData.publishedAt = new Date();
    }
  }

  delete updateData.id;
  await adminDb.collection("lifestylePosts").doc(id).update(updateData);
}

export async function deletePost(id: string): Promise<void> {
  await adminDb.collection("lifestylePosts").doc(id).delete();
}
