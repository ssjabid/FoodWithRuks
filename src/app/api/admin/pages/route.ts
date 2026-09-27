import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/firebase/authCheck";
import { getPageContent, updatePageContent } from "@/lib/firebase/pageContent";
import { normaliseCurrently, ValidationError, LIMITS } from "@/lib/validation";
import { revalidateSiteCopy } from "@/lib/revalidate";
import type { PageContent } from "@/types";

type Editable = Omit<PageContent, "updatedAt" | "currently">;

const TEXT_LIMITS: Record<keyof Editable, number> = {
  heroIntro: 300,
  footerBlurb: 300,
  aboutTitle: 120,
  aboutSubtitle: 200,
  aboutBody: 60_000,
  aboutPhoto: 600,
  aboutPhotoAlt: LIMITS.alt,
};

export async function GET(request: Request) {
  if (!(await verifyAdminRequest(request))) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  try {
    return NextResponse.json(await getPageContent());
  } catch (error) {
    console.error("Page content fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch page content" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!(await verifyAdminRequest(request))) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  try {
    const body = (await request.json()) as Partial<Record<keyof Editable, unknown>> & { currently?: unknown };
    const update: Partial<Editable> & { currently?: ReturnType<typeof normaliseCurrently> } = {};
    for (const key of Object.keys(TEXT_LIMITS) as (keyof Editable)[]) {
      const v = body[key];
      if (v === undefined) continue;
      if (typeof v !== "string") return NextResponse.json({ error: `${key} must be text.` }, { status: 400 });
      if (v.length > TEXT_LIMITS[key]) return NextResponse.json({ error: `${key} is too long (max ${TEXT_LIMITS[key]} characters).` }, { status: 400 });
      update[key] = key === "aboutBody" ? v : v.trim();
    }
    if (body.currently !== undefined) update.currently = normaliseCurrently(body.currently);
    if (Object.keys(update).length === 0) return NextResponse.json({ error: "Nothing to update." }, { status: 400 });

    await updatePageContent(update);
    revalidateSiteCopy();
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ValidationError) return NextResponse.json({ error: error.message }, { status: 400 });
    console.error("Page content update error:", error);
    return NextResponse.json({ error: "Failed to update page content" }, { status: 500 });
  }
}
