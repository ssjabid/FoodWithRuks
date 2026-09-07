import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { verifyAdminRequest } from "@/lib/firebase/authCheck";
import { getAllPosts, createPost } from "@/lib/firebase/lifestyle";

export async function GET(request: Request) {
  const isAdmin = await verifyAdminRequest(request);
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const posts = await getAllPosts();
    return NextResponse.json(posts);
  } catch (error) {
    console.error("Posts fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const isAdmin = await verifyAdminRequest(request);
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const data = await request.json();
    const id = await createPost(data);
    revalidatePublic(typeof data?.slug === "string" ? data.slug : undefined);
    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    console.error("Post create error:", error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}

function revalidatePublic(slug?: string) {
  for (const path of ["/", "/lifestyle"]) revalidatePath(path);
  if (slug) revalidatePath(`/lifestyle/${slug}`);
  revalidatePath("/sitemap.xml");
}
