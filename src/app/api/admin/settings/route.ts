import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { verifyAdminRequest } from "@/lib/firebase/authCheck";
import { getSiteSettings, updateSiteSettings } from "@/lib/firebase/siteSettings";
import { getRecipeBySlug } from "@/lib/firebase/recipes";

const HANDLE_RE = /^@?[A-Za-z0-9._]{1,30}$/;

export async function GET(request: Request) {
  const isAdmin = await verifyAdminRequest(request);
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    return NextResponse.json(await getSiteSettings());
  } catch (error) {
    console.error("Settings fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const isAdmin = await verifyAdminRequest(request);
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = (await request.json()) as { recipeOfTheWeekSlug?: unknown; instagramHandle?: unknown };
    const update: { recipeOfTheWeekSlug?: string; instagramHandle?: string } = {};

    if (typeof body.recipeOfTheWeekSlug === "string") {
      const slug = body.recipeOfTheWeekSlug.trim();
      if (slug) {
        const recipe = await getRecipeBySlug(slug);
        if (!recipe) {
          return NextResponse.json({ error: "That recipe is not published (or does not exist)." }, { status: 400 });
        }
      }
      update.recipeOfTheWeekSlug = slug;
    }

    if (typeof body.instagramHandle === "string") {
      const handle = body.instagramHandle.trim();
      if (!HANDLE_RE.test(handle)) {
        return NextResponse.json({ error: "Instagram handle can only contain letters, numbers, dots and underscores." }, { status: 400 });
      }
      update.instagramHandle = handle.startsWith("@") ? handle : `@${handle}`;
    }

    await updateSiteSettings(update);
    revalidatePath("/");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Settings update error:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
