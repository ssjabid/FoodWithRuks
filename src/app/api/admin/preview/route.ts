import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/firebase/authCheck";
import { previewPath, type PreviewType } from "@/lib/previewToken";

/** GET /api/admin/preview?type=recipe|post&slug=... → { path } (a signed link that shows a draft on the public site). */
export async function GET(request: Request) {
  if (!(await verifyAdminRequest(request))) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const slug = (searchParams.get("slug") || "").trim();
  if ((type !== "recipe" && type !== "post") || !slug || !/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json({ error: "type must be recipe or post and slug is required" }, { status: 400 });
  }
  try {
    return NextResponse.json({ path: previewPath(type as PreviewType, slug) });
  } catch (error) {
    console.error("[preview] cannot sign link:", error);
    return NextResponse.json({ error: "Preview links are not configured (REVALIDATION_SECRET missing)." }, { status: 503 });
  }
}
