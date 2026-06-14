import { NextResponse } from "next/server";
import { deleteNewsletter } from "@/lib/db/newsletters";

export const runtime = "nodejs";

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const ok = await deleteNewsletter(id);
  if (!ok) {
    return NextResponse.json({ error: "Delete failed." }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
