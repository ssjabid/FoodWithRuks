import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(request: Request) {
  try {
    const { secret, path } = await request.json();

    if (secret !== process.env.REVALIDATION_SECRET) {
      return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
    }

    if (path) {
      revalidatePath(path);
    } else {
      revalidatePath("/");
      revalidatePath("/recipes");
      revalidatePath("/lifestyle");
    }

    return NextResponse.json({ revalidated: true });
  } catch {
    return NextResponse.json({ error: "Failed to revalidate" }, { status: 500 });
  }
}
