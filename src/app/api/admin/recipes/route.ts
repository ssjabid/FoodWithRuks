import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/firebase/authCheck";
import { getAllRecipes, createRecipe, recipeSlugExists } from "@/lib/firebase/recipes";
import { normaliseRecipeInput, ValidationError } from "@/lib/validation";
import { revalidateRecipes } from "@/lib/revalidate";

export async function GET(request: Request) {
  if (!(await verifyAdminRequest(request))) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  try {
    return NextResponse.json(await getAllRecipes());
  } catch (error) {
    console.error("Recipes fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch recipes" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await verifyAdminRequest(request))) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  try {
    const data = normaliseRecipeInput(await request.json());
    if (await recipeSlugExists(data.slug)) {
      return NextResponse.json({ error: `Another recipe already uses the slug "${data.slug}".` }, { status: 409 });
    }
    const id = await createRecipe(data);
    revalidateRecipes(data.slug);
    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    if (error instanceof ValidationError) return NextResponse.json({ error: error.message }, { status: 400 });
    console.error("Recipe create error:", error);
    return NextResponse.json({ error: "Failed to create recipe" }, { status: 500 });
  }
}
