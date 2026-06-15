import { NextResponse } from "next/server";
import { deleteSegment } from "@/lib/db/segments";
import { getAdminEmail } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  if (!(await getAdminEmail())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const ok = await deleteSegment(id);
  if (!ok) return NextResponse.json({ error: "Delete failed." }, { status: 502 });
  return NextResponse.json({ ok: true });
}
