import { NextResponse } from "next/server";
import { recordEvent } from "@/lib/db/analytics-events";
import { isSupabaseConfigured } from "@/lib/supabase/admin";

export const runtime = "nodejs";

/** Public, fire-and-forget analytics ingest (pageviews + clicks). */
export async function POST(req: Request) {
  if (!isSupabaseConfigured()) return new NextResponse(null, { status: 204 });

  let body: Record<string, unknown>;
  try {
    // sendBeacon delivers a Blob, so read text and parse rather than req.json().
    body = JSON.parse(await req.text()) as Record<string, unknown>;
  } catch {
    return new NextResponse(null, { status: 204 });
  }

  const type = body.type === "click" ? "click" : body.type === "pageview" ? "pageview" : null;
  if (!type) return new NextResponse(null, { status: 204 });

  const str = (v: unknown) => (typeof v === "string" ? v : null);
  const path = str(body.path);
  // Never record admin traffic.
  if (path && (path.startsWith("/p@ss1") || path.startsWith("/admin"))) {
    return new NextResponse(null, { status: 204 });
  }

  try {
    await recordEvent({
      type,
      path,
      label: str(body.label),
      href: str(body.href),
      referrer: str(body.referrer),
      session: str(body.session),
    });
  } catch {
    // best-effort
  }
  return new NextResponse(null, { status: 204 });
}
