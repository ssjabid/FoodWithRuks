import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { getRecipeBySlug } from "@/lib/firebase/recipes";
import { createComment } from "@/lib/firebase/comments";
import { clientIp, honeypotTripped, rateLimited } from "@/lib/rateLimit";

/**
 * POST /api/comments  { recipeSlug, name, text, rating, website? }
 * Stores a pending comment for a published recipe. Approved in /admin/comments.
 */
export async function POST(request: Request) {
  let body: { recipeSlug?: unknown; name?: unknown; text?: unknown; rating?: unknown; website?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Bots fill every field; pretend it worked.
  if (honeypotTripped(body.website)) return NextResponse.json({ ok: true });

  const ip = clientIp(request);
  if (rateLimited(`comment:${ip}`, { windowMs: 10 * 60 * 1000, max: 5 })) {
    return NextResponse.json({ error: "Too many comments in a short time. Please try again later." }, { status: 429 });
  }

  const recipeSlug = typeof body.recipeSlug === "string" ? body.recipeSlug.trim() : "";
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const text = typeof body.text === "string" ? body.text.trim() : "";
  const rating = typeof body.rating === "number" ? Math.round(body.rating) : Number(body.rating);

  if (!recipeSlug || !/^[a-z0-9-]+$/.test(recipeSlug)) return NextResponse.json({ error: "Unknown recipe." }, { status: 400 });
  if (name.length < 2 || name.length > 60) return NextResponse.json({ error: "Please add your name (2-60 characters)." }, { status: 400 });
  if (text.length < 10 || text.length > 2000) return NextResponse.json({ error: "Comments need 10-2000 characters." }, { status: 400 });
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return NextResponse.json({ error: "Please choose a rating from 1 to 5." }, { status: 400 });

  try {
    const recipe = await getRecipeBySlug(recipeSlug);
    if (!recipe) return NextResponse.json({ error: "Unknown recipe." }, { status: 404 });

    const ipHash = createHash("sha256").update(`${ip}|${process.env.REVALIDATION_SECRET || ""}`).digest("hex").slice(0, 32);
    await createComment({ recipeId: recipe.id, recipeSlug, name, text, rating, ipHash });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[comments] create failed:", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
