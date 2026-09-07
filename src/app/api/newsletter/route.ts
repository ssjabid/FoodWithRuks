import { NextResponse } from "next/server";
import { addSubscriber, normaliseEmail, SUBSCRIBER_SOURCES } from "@/lib/firebase/subscribers";
import type { SubscriberSource } from "@/types";

// RFC-lite: good enough to reject junk without rejecting real addresses.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Best-effort per-instance rate limit (5 attempts / 10 minutes per IP).
// Serverless instances don't share memory, so this is a speed bump, not a wall;
// the honeypot + email-as-doc-id dedupe do the real work.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const attempts = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (attempts.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  attempts.set(ip, recent);
  if (attempts.size > 5000) attempts.clear();
  return recent.length > MAX_PER_WINDOW;
}

export async function POST(request: Request) {
  let body: { email?: unknown; source?: unknown; website?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Honeypot: bots fill every field. Pretend it worked.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "Too many attempts. Please try again in a few minutes." }, { status: 429 });
  }

  const email = typeof body.email === "string" ? normaliseEmail(body.email) : "";
  if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  const source: SubscriberSource = SUBSCRIBER_SOURCES.includes(body.source as SubscriberSource)
    ? (body.source as SubscriberSource)
    : "home";

  try {
    await addSubscriber({ email, source });
    // Same response for new + existing addresses so the form can't be used to probe the list.
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[newsletter] subscribe failed:", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
