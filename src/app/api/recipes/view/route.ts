import { NextResponse } from "next/server";
import { incrementRecipeViews } from "@/lib/firebase/recipes";
import { clientIp, rateLimited } from "@/lib/rateLimit";

/**
 * POST /api/recipes/view  { slug }
 * Counts one view of a published recipe. Called once per browser session from
 * the recipe page (ViewPing). Feeds "Most loved" and the Popular sort.
 */
export async function POST(request: Request) {
  let body: { slug?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const slug = typeof body.slug === "string" ? body.slug.trim() : "";
  if (!slug || slug.length > 200 || !/^[a-z0-9-]+$/.test(slug)) return NextResponse.json({ ok: false }, { status: 400 });

  // One increment per slug per IP per hour (best effort)
  if (rateLimited(`view:${clientIp(request)}:${slug}`, { windowMs: 60 * 60 * 1000, max: 1 })) {
    return NextResponse.json({ ok: true });
  }

  try {
    await incrementRecipeViews(slug);
  } catch (error) {
    console.error("[view] increment failed:", error);
  }
  return NextResponse.json({ ok: true });
}
