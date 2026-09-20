import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/firebase/authCheck";
import { commitFiles, isUploadConfigured, rawUrlFor } from "@/lib/github";
import { slugify } from "@/lib/utils";

/**
 * POST /api/admin/upload
 * Body: { name: string, folder: "recipes" | "lifestyle" | "steps" | "misc",
 *         variants: { width: number, dataUrl: string }[] }   (WebP data URLs, resized in the browser)
 * Commits every variant to the repo in one commit and returns the public URLs.
 */

const FOLDERS = new Set(["recipes", "lifestyle", "steps", "misc"]);
const MAX_VARIANTS = 3;
const MAX_BASE64_CHARS = 2_400_000; // ~1.8 MB per variant
const DATA_URL_RE = /^data:image\/(webp|jpeg|png);base64,([A-Za-z0-9+/=]+)$/;

export async function POST(request: Request) {
  const isAdmin = await verifyAdminRequest(request);
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  if (!isUploadConfigured()) {
    return NextResponse.json(
      { error: "Photo uploads are not set up yet (GITHUB_UPLOAD_TOKEN missing). Paste an image link instead." },
      { status: 503 }
    );
  }

  let body: { name?: unknown; folder?: unknown; variants?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const folder = typeof body.folder === "string" && FOLDERS.has(body.folder) ? body.folder : "misc";
  const rawName = typeof body.name === "string" ? body.name : "photo";
  const base = slugify(rawName.replace(/\.[a-z0-9]+$/i, "")).slice(0, 40) || "photo";
  const variants = Array.isArray(body.variants) ? body.variants : [];

  if (variants.length === 0 || variants.length > MAX_VARIANTS) {
    return NextResponse.json({ error: "Expected 1 to 3 image variants" }, { status: 400 });
  }

  const now = new Date();
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const id = now.getTime().toString(36) + Math.random().toString(36).slice(2, 6);
  const dir = `public/images/uploads/${folder}/${yyyy}/${mm}`;

  const files: { path: string; contentBase64: string; width: number }[] = [];
  for (const v of variants as { width?: unknown; dataUrl?: unknown }[]) {
    const width = typeof v.width === "number" && v.width > 0 ? Math.round(v.width) : 0;
    const m = typeof v.dataUrl === "string" ? v.dataUrl.match(DATA_URL_RE) : null;
    if (!width || !m) return NextResponse.json({ error: "Invalid image data" }, { status: 400 });
    if (m[2].length > MAX_BASE64_CHARS) return NextResponse.json({ error: "Image too large after resizing" }, { status: 413 });
    const ext = m[1] === "jpeg" ? "jpg" : m[1];
    files.push({ path: `${dir}/${base}-${id}-w${width}.${ext}`, contentBase64: m[2], width });
  }
  files.sort((a, b) => b.width - a.width);

  try {
    const { sha } = await commitFiles(
      files.map(({ path, contentBase64 }) => ({ path, contentBase64 })),
      `content: add photo ${base} (${folder})`
    );
    const toPublic = (p: string) => p.replace(/^public/, "");
    return NextResponse.json({
      url: toPublic(files[0].path),
      preview: rawUrlFor(files[0].path),
      variants: files.map((f) => ({ width: f.width, url: toPublic(f.path) })),
      commit: sha,
    });
  } catch (error) {
    console.error("[upload] GitHub commit failed:", error);
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
