import { adminDb } from "./admin";
import type { Comment, PublicComment } from "@/types";

function docToComment(doc: FirebaseFirestore.QueryDocumentSnapshot): Comment {
  const data = doc.data();
  return {
    id: doc.id,
    recipeId: data.recipeId,
    recipeSlug: data.recipeSlug,
    name: data.name || "",
    text: data.text,
    rating: data.rating,
    status: data.status || "pending",
    createdAt: data.createdAt?.toDate() || new Date(),
    ipHash: data.ipHash || "",
  };
}

export async function getAllComments(): Promise<Comment[]> {
  const snapshot = await adminDb.collection("comments").orderBy("createdAt", "desc").get();
  return snapshot.docs.map(docToComment);
}

export async function getCommentById(id: string): Promise<Comment | null> {
  const doc = await adminDb.collection("comments").doc(id).get();
  if (!doc.exists) return null;
  return docToComment(doc as FirebaseFirestore.QueryDocumentSnapshot);
}

/** Approved comments for a recipe page, newest first. Serialisable for client components. */
export async function getApprovedComments(recipeSlug: string, limit = 100): Promise<PublicComment[]> {
  const snapshot = await adminDb
    .collection("comments")
    .where("recipeSlug", "==", recipeSlug)
    .where("status", "==", "approved")
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();
  return snapshot.docs.map((d) => {
    const c = docToComment(d);
    return { id: c.id, name: c.name || "Reader", text: c.text, rating: c.rating, createdAt: c.createdAt.toISOString() };
  });
}

export async function createComment(input: {
  recipeId: string;
  recipeSlug: string;
  name: string;
  text: string;
  rating: number;
  ipHash: string;
}): Promise<string> {
  const ref = await adminDb.collection("comments").add({ ...input, status: "pending", createdAt: new Date() });
  return ref.id;
}

export async function updateCommentStatus(id: string, status: "pending" | "approved"): Promise<void> {
  await adminDb.collection("comments").doc(id).update({ status });
}

export async function deleteComment(id: string): Promise<void> {
  await adminDb.collection("comments").doc(id).delete();
}
