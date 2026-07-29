import { NextResponse } from "next/server";
import { requireApiCapability } from "@/lib/auth/access";
import { deleteAnchorResponses } from "@/lib/db/anchorClub";
import { logMemberAction } from "@/lib/db/adminActivity";

export const runtime = "nodejs";

/**
 * Delete Anchor Club registrations. Admin-only (`anchor` capability).
 * body: { ids: string[] } — one id or many, so the same route serves the row
 * modal and the bulk selection toolbar.
 *
 * Deleting removes the only thing stopping that email from registering again:
 * the public form rejects an email that already has a row, so a deleted person
 * can go through /anchor-club afresh and gets a new KAC- reference. Their
 * audience subscription is left alone — unsubscribing is a separate action.
 */
export async function POST(req: Request) {
  const access = await requireApiCapability("anchor");
  if (!access) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const ids = Array.isArray(body.ids)
    ? body.ids.filter((v): v is string => typeof v === "string" && v.trim() !== "")
    : [];
  if (ids.length === 0) {
    return NextResponse.json({ error: "No registrations selected." }, { status: 400 });
  }
  if (ids.length > 500) {
    return NextResponse.json({ error: "Too many at once (max 500)." }, { status: 400 });
  }

  const deleted = await deleteAnchorResponses(ids);
  if (deleted.length === 0) {
    return NextResponse.json({ error: "Nothing was deleted." }, { status: 502 });
  }

  await logMemberAction(
    access.email,
    "anchor.delete",
    deleted.map((d) => d.email).join(", ").slice(0, 500),
    { count: deleted.length, refs: deleted.map((d) => d.ref).filter(Boolean) }
  );

  return NextResponse.json({ ok: true, deleted: deleted.length });
}
