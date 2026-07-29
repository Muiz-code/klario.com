import { NextResponse } from "next/server";
import { requireTeamAccess } from "@/lib/auth/access";
import { updateRole, deleteRole } from "@/lib/db/rbac";
import { isCapability, type Capability } from "@/lib/auth/capabilities";
import { logMemberAction } from "@/lib/db/adminActivity";

export const runtime = "nodejs";

function sanitizeCaps(input: unknown): Capability[] {
  if (!Array.isArray(input)) return [];
  return [...new Set(input.filter(isCapability))];
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const access = await requireTeamAccess();
  if (!access) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await ctx.params;
  let body: { name?: unknown; capabilities?: unknown; is_superadmin?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const patch: { name?: string; capabilities?: Capability[]; is_superadmin?: boolean } = {};
  if (typeof body.name === "string") patch.name = body.name.trim().slice(0, 60);
  if ("capabilities" in body) patch.capabilities = sanitizeCaps(body.capabilities);
  // Superadmin is env-owner-only — never grantable to a DB role.
  if ("is_superadmin" in body) patch.is_superadmin = false;

  const role = await updateRole(id, patch);
  if (!role) return NextResponse.json({ error: "Could not update role." }, { status: 502 });
  await logMemberAction(access.email, "update_role", role.name);
  return NextResponse.json({ ok: true, role });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const access = await requireTeamAccess();
  if (!access) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await ctx.params;
  const ok = await deleteRole(id);
  if (!ok) return NextResponse.json({ error: "Could not delete role." }, { status: 502 });
  await logMemberAction(access.email, "delete_role", id);
  return NextResponse.json({ ok: true });
}
