import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { verifyAdminRequest } from "@/lib/firebase/authCheck";
import { getRecipeById, updateRecipe, deleteRecipe, recipeSlugExists } from "@/lib/firebase/recipes";
import { normaliseRecipeInput, ValidationError } from "@/lib/validation";

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
    const existing = await getRecipeById(id);
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const data = normaliseRecipeInput(await request.json());
    if (data.slug !== existing.slug && (await recipeSlugExists(data.slug, id))) {
      return NextResponse.json({ error: `Another recipe already uses the slug "${data.slug}".` }, { status: 409 });
    }
    await updateRecipe(id, data);
    revalidatePublic(data.slug);
    if (existing.slug !== data.slug) revalidatePath(`/recipes/${existing.slug}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ValidationError) return NextResponse.json({ error: error.message }, { status: 400 });
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
