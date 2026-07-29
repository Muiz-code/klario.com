import { NextResponse } from "next/server";
import { requireSuperadmin } from "@/lib/auth/access";
import { updateMember, deleteMember, listRoles } from "@/lib/db/rbac";
import { logMemberAction } from "@/lib/db/adminActivity";

export const runtime = "nodejs";

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const access = await requireSuperadmin();
  if (!access) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await ctx.params;
  let body: { roleId?: unknown; status?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const patch: { role_id?: string | null; status?: "active" | "disabled" } = {};
  if ("roleId" in body) patch.role_id = typeof body.roleId === "string" ? body.roleId : null;
  if (body.status === "active" || body.status === "disabled") patch.status = body.status;

  // Never let a member be moved into a superadmin role (env owners only).
  if (patch.role_id) {
    const role = (await listRoles()).find((r) => r.id === patch.role_id);
    if (role?.is_superadmin) {
      return NextResponse.json(
        { error: "You can't assign the superadmin role." },
        { status: 403 }
      );
    }
  }

  const member = await updateMember(id, patch);
  if (!member) return NextResponse.json({ error: "Could not update member." }, { status: 502 });
  await logMemberAction(access.email, "update_member", member.email, patch);
  return NextResponse.json({ ok: true, member });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const access = await requireSuperadmin();
  if (!access) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await ctx.params;
  const ok = await deleteMember(id);
  if (!ok) return NextResponse.json({ error: "Could not remove member." }, { status: 502 });
  await logMemberAction(access.email, "remove_member", id);
  return NextResponse.json({ ok: true });
}
