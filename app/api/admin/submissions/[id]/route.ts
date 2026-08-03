import { NextResponse } from "next/server";
import { deleteSubmission } from "@/lib/db/submissions";
import { logAction } from "@/lib/db/adminActivity";

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
  await logAction("submission.delete", { target: id });
  return NextResponse.json({ ok: true });
}
