import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { clientIp, honeypotTripped, rateLimited } from "@/lib/rateLimit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(request: Request) {
  let body: { name?: unknown; email?: unknown; subject?: unknown; message?: unknown; website?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (honeypotTripped(body.website)) return NextResponse.json({ success: true });

  if (rateLimited(`contact:${clientIp(request)}`, { windowMs: 10 * 60 * 1000, max: 5 })) {
    return NextResponse.json({ error: "Too many messages in a short time. Please try again later." }, { status: 429 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const subject = typeof body.subject === "string" ? body.subject.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!name || name.length > 100) return NextResponse.json({ error: "Please add your name." }, { status: 400 });
  if (!email || email.length > 254 || !EMAIL_RE.test(email)) return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  if (!subject || subject.length > 150) return NextResponse.json({ error: "Please add a subject." }, { status: 400 });
  if (message.length < 10 || message.length > 5000) return NextResponse.json({ error: "Messages need 10-5000 characters." }, { status: 400 });

  try {
    await adminDb.collection("contactMessages").add({ name, email, subject, message, read: false, createdAt: new Date() });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[contact] save failed:", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
