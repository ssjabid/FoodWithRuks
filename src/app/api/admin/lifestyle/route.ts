import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/firebase/authCheck";
import { getAllPosts, createPost, postSlugExists } from "@/lib/firebase/lifestyle";
import { normalisePostInput, ValidationError } from "@/lib/validation";
import { revalidatePosts } from "@/lib/revalidate";

export async function GET(request: Request) {
  if (!(await verifyAdminRequest(request))) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  try {
    return NextResponse.json(await getAllPosts());
  } catch (error) {
    console.error("Posts fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await verifyAdminRequest(request))) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  try {
    const data = normalisePostInput(await request.json());
    if (await postSlugExists(data.slug)) {
      return NextResponse.json({ error: `Another story already uses the slug "${data.slug}".` }, { status: 409 });
    }
    const id = await createPost(data);
    revalidatePosts(data.slug);
    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    if (error instanceof ValidationError) return NextResponse.json({ error: error.message }, { status: 400 });
    console.error("Post create error:", error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}
