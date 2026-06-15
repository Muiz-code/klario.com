import { NextResponse } from "next/server";
import {
  getSegment,
  resolveMembers,
  segmentToDef,
} from "@/lib/db/segments";
import { getAdminEmail } from "@/lib/supabase/server";
import type { SegmentDef } from "@/lib/segments/types";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Resolve a segment to its members. Accepts either a raw definition (built-in or
 * unsaved) as { def } or a saved segment as { id }. Returns the count and the
 * member rows (capped) so the UI can list / export / target a send.
 */
export async function POST(req: Request) {
  if (!(await getAdminEmail())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { def?: SegmentDef; id?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  let def: SegmentDef | null = null;
  if (typeof body.id === "string") {
    const seg = await getSegment(body.id);
    if (!seg) {
      return NextResponse.json({ error: "Segment not found." }, { status: 404 });
    }
    def = segmentToDef(seg);
  } else if (body.def && Array.isArray(body.def.rules)) {
    def = { match: body.def.match === "any" ? "any" : "all", rules: body.def.rules };
  }

  if (!def) {
    return NextResponse.json({ error: "Provide a segment def or id." }, { status: 400 });
  }

  const { count, members } = await resolveMembers(def);
  return NextResponse.json({
    ok: true,
    count,
    members: members.map((m) => ({
      id: m.id,
      email: m.email,
      first_name: m.first_name,
      last_name: m.last_name,
      status: m.status,
      source: m.source,
      created_at: m.created_at,
    })),
  });
}
