import { NextResponse } from "next/server";
import { deleteSignup, setStatus, type SignupStatus } from "@/lib/db/signups";

export const runtime = "nodejs";

const VALID: SignupStatus[] = ["pending", "invited", "active", "unsubscribed"];

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  let body: { status?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const status = body.status;
  if (typeof status !== "string" || !VALID.includes(status as SignupStatus)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }
  const ok = await setStatus(id, status as SignupStatus);
  if (!ok) return NextResponse.json({ error: "Update failed." }, { status: 502 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const ok = await deleteSignup(id);
  if (!ok) return NextResponse.json({ error: "Delete failed." }, { status: 502 });
  return NextResponse.json({ ok: true });
}
