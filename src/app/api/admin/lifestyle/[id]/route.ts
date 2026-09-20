import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { verifyAdminRequest } from "@/lib/firebase/authCheck";
import { getPostById, updatePost, deletePost, postSlugExists } from "@/lib/firebase/lifestyle";
import { normalisePostInput, ValidationError } from "@/lib/validation";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const isAdmin = await verifyAdminRequest(request);
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const post = await getPostById(id);
    if (!post) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(post);
  } catch (error) {
    console.error("Post fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const isAdmin = await verifyAdminRequest(request);
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const existing = await getPostById(id);
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const data = normalisePostInput(await request.json());
    if (data.slug !== existing.slug && (await postSlugExists(data.slug, id))) {
      return NextResponse.json({ error: `Another story already uses the slug "${data.slug}".` }, { status: 409 });
    }
    await updatePost(id, data);
    revalidatePublic(data.slug);
    if (existing.slug !== data.slug) revalidatePath(`/lifestyle/${existing.slug}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ValidationError) return NextResponse.json({ error: error.message }, { status: 400 });
    console.error("Post update error:", error);
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const isAdmin = await verifyAdminRequest(request);
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const existing = await getPostById(id);
    await deletePost(id);
    revalidatePublic(existing?.slug);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Post delete error:", error);
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}

function revalidatePublic(slug?: string) {
  for (const path of ["/", "/lifestyle"]) revalidatePath(path);
  if (slug) revalidatePath(`/lifestyle/${slug}`);
  revalidatePath("/sitemap.xml");
}
