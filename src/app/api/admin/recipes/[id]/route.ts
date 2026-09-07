import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { verifyAdminRequest } from "@/lib/firebase/authCheck";
import { getRecipeById, updateRecipe, deleteRecipe } from "@/lib/firebase/recipes";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const isAdmin = await verifyAdminRequest(request);
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const recipe = await getRecipeById(id);
    if (!recipe) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(recipe);
  } catch (error) {
    console.error("Recipe fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch recipe" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const isAdmin = await verifyAdminRequest(request);
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const data = await request.json();
    await updateRecipe(id, data);
    revalidatePublic(typeof data?.slug === "string" ? data.slug : undefined);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Recipe update error:", error);
    return NextResponse.json({ error: "Failed to update recipe" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const isAdmin = await verifyAdminRequest(request);
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const existing = await getRecipeById(id);
    await deleteRecipe(id);
    revalidatePublic(existing?.slug);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Recipe delete error:", error);
    return NextResponse.json({ error: "Failed to delete recipe" }, { status: 500 });
  }
}

function revalidatePublic(slug?: string) {
  for (const path of ["/", "/recipes"]) revalidatePath(path);
  if (slug) revalidatePath(`/recipes/${slug}`);
  revalidatePath("/sitemap.xml");
}
