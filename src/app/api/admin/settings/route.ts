import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/firebase/authCheck";
import { getSiteSettings, updateSiteSettings } from "@/lib/firebase/siteSettings";
import { getRecipeBySlug } from "@/lib/firebase/recipes";
import { isCollectionSlug } from "@/lib/collections";
import { LIMITS } from "@/lib/validation";
import { revalidateSiteCopy } from "@/lib/revalidate";

const HANDLE_RE = /^@?[A-Za-z0-9._]{1,30}$/;

export async function GET(request: Request) {
  if (!(await verifyAdminRequest(request))) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  try {
    return NextResponse.json(await getSiteSettings());
  } catch (error) {
    console.error("Settings fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!(await verifyAdminRequest(request))) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  try {
    const body = (await request.json()) as {
      recipeOfTheWeekSlug?: unknown;
      instagramHandle?: unknown;
      heroNote?: unknown;
      activeCollection?: unknown;
      showBakery?: unknown;
    };
    const update: {
      recipeOfTheWeekSlug?: string;
      instagramHandle?: string;
      heroNote?: string;
      activeCollection?: string;
      showBakery?: boolean;
    } = {};

    if (typeof body.recipeOfTheWeekSlug === "string") {
      const slug = body.recipeOfTheWeekSlug.trim();
      if (slug) {
        const recipe = await getRecipeBySlug(slug);
        if (!recipe) return NextResponse.json({ error: "That recipe is not published (or does not exist)." }, { status: 400 });
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

    if (body.heroNote !== undefined) {
      if (typeof body.heroNote !== "string") return NextResponse.json({ error: "The home note must be text." }, { status: 400 });
      if (body.heroNote.length > LIMITS.heroNote) return NextResponse.json({ error: `The home note is too long (max ${LIMITS.heroNote} characters).` }, { status: 400 });
      update.heroNote = body.heroNote.trim();
    }

    if (body.activeCollection !== undefined) {
      if (body.activeCollection !== "" && !isCollectionSlug(body.activeCollection)) {
        return NextResponse.json({ error: "Unknown collection." }, { status: 400 });
      }
      update.activeCollection = body.activeCollection as string;
    }

    if (body.showBakery !== undefined) {
      if (typeof body.showBakery !== "boolean") return NextResponse.json({ error: "showBakery must be true or false." }, { status: 400 });
      update.showBakery = body.showBakery;
    }

    await updateSiteSettings(update);
    revalidateSiteCopy();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Settings update error:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
