import { NextResponse } from "next/server";
import { requireTeamAccess } from "@/lib/auth/access";
import { listRoles, createRole } from "@/lib/db/rbac";
import { isCapability, type Capability } from "@/lib/auth/capabilities";
import { logMemberAction } from "@/lib/db/adminActivity";

export const runtime = "nodejs";

function sanitizeCaps(input: unknown): Capability[] {
  if (!Array.isArray(input)) return [];
  return [...new Set(input.filter(isCapability))];
}

export async function GET() {
  if (!(await requireTeamAccess())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json({ roles: await listRoles() });
}

export async function POST(req: Request) {
  const access = await requireTeamAccess();
  if (!access) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  let body: { name?: unknown; capabilities?: unknown; is_superadmin?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const name = String(body.name ?? "").trim().slice(0, 60);
  if (!name) return NextResponse.json({ error: "A role name is required." }, { status: 400 });

  // Superadmin is reserved for env ADMIN_EMAILS owners — never creatable here.
  const role = await createRole({
    name,
    capabilities: sanitizeCaps(body.capabilities),
    is_superadmin: false,
  });
  if (!role) return NextResponse.json({ error: "Could not create role (name taken?)." }, { status: 502 });
  await logMemberAction(access.email, "create_role", name);
  return NextResponse.json({ ok: true, role });
}
