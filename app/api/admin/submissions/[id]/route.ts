import { NextResponse } from "next/server";
import { deleteSubmission } from "@/lib/db/submissions";

export const runtime = "nodejs";

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const ok = await deleteSubmission(id);
  if (!ok) {
    return NextResponse.json({ error: "Delete failed." }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
