/**
 * Best-effort in-memory rate limit for public POST endpoints.
 * Serverless instances do not share memory, so this is a speed bump rather
 * than a wall; honeypots and server-side validation do the real work.
 */

const buckets = new Map<string, number[]>();

export interface RateLimitOptions {
  /** Window length in ms */
  windowMs: number;
  /** Max hits per window */
  max: number;
}

export function clientIp(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

/** Returns true when the caller has exceeded the limit for this key. */
export function rateLimited(key: string, { windowMs, max }: RateLimitOptions): boolean {
  const now = Date.now();
  const recent = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  recent.push(now);
  buckets.set(key, recent);
  if (buckets.size > 5000) buckets.clear();
  return recent.length > max;
}

/** True when a honeypot field was filled in (bots fill every field). */
export function honeypotTripped(value: unknown): boolean {
  return typeof value === "string" && value.trim() !== "";
}
