import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { requireSuperadmin } from "@/lib/auth/access";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { listMembers, createMember, listRoles } from "@/lib/db/rbac";
import { renderTeamInvite } from "@/lib/email/teamInvite";
import { resend, RESEND_FROM, RESEND_REPLY_TO } from "@/lib/email/client";
import { logMemberAction } from "@/lib/db/adminActivity";

export const runtime = "nodejs";

export async function GET() {
  if (!(await requireSuperadmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const [members, roles] = await Promise.all([listMembers(), listRoles()]);
  return NextResponse.json({ members, roles });
}

/** Invite a member: create their auth user with a temp password + email it. */
export async function POST(req: Request) {
  const access = await requireSuperadmin();
  if (!access) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body: { email?: unknown; roleId?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const email = String(body.email ?? "").trim().toLowerCase();
  const roleId = typeof body.roleId === "string" ? body.roleId : null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
  }

  // Superadmin is reserved for env owners — you can't invite someone into it.
  const roles = await listRoles();
  const chosenRole = roles.find((r) => r.id === roleId);
  if (chosenRole?.is_superadmin) {
    return NextResponse.json(
      { error: "You can't invite someone as a superadmin." },
      { status: 403 }
    );
  }

  const tempPassword = `Klario-${randomBytes(4).toString("hex")}-${randomBytes(2).toString("hex")}`;

  // Create the Supabase auth user (email pre-confirmed) with the temp password.
  // If the email already has an account, grant access with their existing
  // password (no forced change).
  const db = supabaseAdmin();
  const { error: authErr } = await db.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
  });
  const existingAccount = !!authErr && /already|registered|exists/i.test(authErr.message);
  if (authErr && !existingAccount) {
    return NextResponse.json({ error: authErr.message }, { status: 502 });
  }
  const isNewUser = !existingAccount;

  const member = await createMember({
    email,
    role_id: roleId,
    invited_by: access.email,
    mustChangePassword: isNewUser,
  });
  if (!member) {
    return NextResponse.json(
      { error: "Could not save member — they may already be invited." },
      { status: 502 }
    );
  }

  const roleName = chosenRole?.name ?? "Member";
  const mail = renderTeamInvite({
    email,
    tempPassword: isNewUser ? tempPassword : null,
    roleName,
    invitedBy: access.email,
  });
  let emailed = false;
  try {
    const { error } = await resend.emails.send({
      from: RESEND_FROM,
      to: email,
      replyTo: RESEND_REPLY_TO,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
    });
    emailed = !error;
  } catch {
    emailed = false;
  }

  await logMemberAction(access.email, "invite_member", email, { roleId, roleName, existingAccount });
  // Return the temp password (new users only) so the superadmin can share it
  // manually if the invite email didn't send. It only works until they set theirs.
  return NextResponse.json({
    ok: true,
    member,
    tempPassword: isNewUser ? tempPassword : null,
    emailed,
    existingAccount,
  });
}
