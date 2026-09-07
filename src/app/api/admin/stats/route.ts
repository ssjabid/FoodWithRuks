import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/firebase/authCheck";
import { adminDb } from "@/lib/firebase/admin";

export async function GET(request: Request) {
  const isAdmin = await verifyAdminRequest(request);
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const [recipes, posts, comments, messages, subscribers] = await Promise.all([
      adminDb.collection("recipes").count().get(),
      adminDb.collection("lifestylePosts").count().get(),
      adminDb.collection("comments").where("status", "==", "pending").count().get(),
      adminDb.collection("contactMessages").where("read", "==", false).count().get(),
      adminDb.collection("subscribers").where("status", "==", "subscribed").count().get(),
    ]);

    return NextResponse.json({
      totalRecipes: recipes.data().count,
      totalPosts: posts.data().count,
      pendingComments: comments.data().count,
      unreadMessages: messages.data().count,
      subscribers: subscribers.data().count,
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
