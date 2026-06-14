import { NextResponse } from "next/server";
import { getAuditRecipients } from "@/lib/db/audit";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const recipients = await getAuditRecipients(id);
  return NextResponse.json({ recipients });
}
