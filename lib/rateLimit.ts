import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";

/**
 * Limits for the public endpoints, which anyone can call without signing in.
 * Each call counts against the caller's IP and, on forms, the email given;
 * past the limit the caller gets a 429 and nothing is saved or sent.
 *
 * Counts live in the database (rate_limits, migration 0026): Vercel runs many
 * instances that share no memory. If the database cannot be reached the call
 * is let through, so an outage never blocks a real sign-up; abuse during an
 * outage is the smaller risk.
 */
export type Limit = { max: number; windowSeconds: number };

export const LIMITS = {
  /** Forms that save a row and send email: tight. */
  form: { ip: { max: 5, windowSeconds: 600 }, email: { max: 3, windowSeconds: 3600 } },
  /** Unsubscribe and beta links: a person clicks a few times at most. */
  link: { ip: { max: 30, windowSeconds: 600 } },
  /** Page tracking and blog views: frequent, but not thousands. */
  beacon: { ip: { max: 120, windowSeconds: 60 } },
} as const;

/** The caller's IP as Vercel passes it. */
export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for") ?? "";
  return fwd.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}

const hash = (s: string) => createHash("sha256").update(s).digest("hex").slice(0, 32);

async function allowed(bucket: string, key: string, l: Limit): Promise<boolean> {
  if (!isSupabaseConfigured()) return true;
  try {
    const { data, error } = await supabaseAdmin().rpc("check_rate_limit", {
      p_bucket: bucket, p_key: key, p_max: l.max, p_window_seconds: l.windowSeconds,
    });
    if (error) { console.warn("[rateLimit]", bucket, error.message); return true; }
    return data === true;
  } catch (e) {
    console.warn("[rateLimit]", bucket, e instanceof Error ? e.message : e);
    return true;
  }
}

/**
 * A 429 to return, or null to carry on. Call it first in a handler:
 *
 *   const limited = await rateLimited(req, "contact", LIMITS.form, email);
 *   if (limited) return limited;
 */
export async function rateLimited(
  req: Request,
  bucket: string,
  limits: { ip: Limit; email?: Limit },
  email?: string | null,
): Promise<NextResponse | null> {
  const okIp = await allowed(`${bucket}:ip`, hash(clientIp(req)), limits.ip);
  const okEmail = !email || !limits.email ? true : await allowed(`${bucket}:email`, hash(email.toLowerCase()), limits.email);
  if (okIp && okEmail) return null;
  return NextResponse.json(
    { error: "Too many requests. Please wait a little and try again." },
    { status: 429, headers: { "Retry-After": String(limits.ip.windowSeconds) } },
  );
}
