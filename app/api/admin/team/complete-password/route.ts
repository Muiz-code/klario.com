import { NextResponse } from "next/server";
import { getAccess } from "@/lib/auth/access";
import { clearMustChangePassword } from "@/lib/db/rbac";
import { logMemberAction } from "@/lib/db/adminActivity";

export const runtime = "nodejs";

/**
 * Called after a member sets their own password (client-side auth.updateUser).
 * Clears the forced-change flag for the signed-in member so they get in.
 */
export async function POST() {
  const access = await getAccess();
  if (!access) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await clearMustChangePassword(access.email);
  await logMemberAction(access.email, "set_password");
  return NextResponse.json({ ok: true });
}
