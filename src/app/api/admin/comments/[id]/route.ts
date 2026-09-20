import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { verifyAdminRequest } from "@/lib/firebase/authCheck";
import { deleteComment, getCommentById, updateCommentStatus } from "@/lib/firebase/comments";
import { recomputeRecipeRating } from "@/lib/firebase/recipes";

async function afterChange(recipeId: string, recipeSlug: string) {
  await recomputeRecipeRating(recipeId);
  revalidatePath(`/recipes/${recipeSlug}`);
  revalidatePath("/recipes");
  revalidatePath("/");
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await verifyAdminRequest(request))) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  try {
    const { id } = await params;
    const { status } = await request.json();
    if (status !== "approved" && status !== "pending") return NextResponse.json({ error: "status must be approved or pending" }, { status: 400 });
    const comment = await getCommentById(id);
    if (!comment) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await updateCommentStatus(id, status);
    await afterChange(comment.recipeId, comment.recipeSlug);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Comment update error:", error);
    return NextResponse.json({ error: "Failed to update comment" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await verifyAdminRequest(request))) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  try {
    const { id } = await params;
    const comment = await getCommentById(id);
    await deleteComment(id);
    if (comment) await afterChange(comment.recipeId, comment.recipeSlug);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Comment delete error:", error);
    return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 });
  }
}
