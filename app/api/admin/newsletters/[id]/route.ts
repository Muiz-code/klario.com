import { NextResponse } from "next/server";
import { deleteNewsletter, getNewsletter } from "@/lib/db/newsletters";
import { logAction } from "@/lib/db/adminActivity";

export const runtime = "nodejs";

/**
 * One mail, body included — for the preview modal on the Mail list. Fetched on
 * click rather than shipped with the list, so 200 rows of email HTML don't ride
 * along in the page payload.
 */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const newsletter = await getNewsletter(id);
  if (!newsletter) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  return NextResponse.json({ newsletter });
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const ok = await deleteNewsletter(id);
  if (!ok) {
    return NextResponse.json({ error: "Delete failed." }, { status: 502 });
  }
  await logAction("mail.delete", { target: id });
  return NextResponse.json({ ok: true });
}
