import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { requireSuperadmin } from "@/lib/auth/access";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getMemberById, updateMember } from "@/lib/db/rbac";
import { renderTeamInvite } from "@/lib/email/teamInvite";
import { resend, RESEND_FROM, RESEND_REPLY_TO } from "@/lib/email/client";
import { logMemberAction } from "@/lib/db/adminActivity";

export const runtime = "nodejs";

/** Find a Supabase auth user id by email (paginated; fine for a small team). */
async function findAuthUserId(email: string): Promise<string | null> {
  const db = supabaseAdmin();
  const target = email.toLowerCase();
  for (let page = 1; page <= 10; page++) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: 200 });
    if (error) return null;
    const hit = data.users.find((u) => u.email?.toLowerCase() === target);
    if (hit) return hit.id;
    if (data.users.length < 200) break;
  }
  return null;
}

/** Resend an invite: reset the member's temp password and re-send the email. */
export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const access = await requireSuperadmin();
  if (!access) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await ctx.params;

  const member = await getMemberById(id);
  if (!member) return NextResponse.json({ error: "Member not found." }, { status: 404 });

  const tempPassword = `Klario-${randomBytes(4).toString("hex")}-${randomBytes(2).toString("hex")}`;
  const userId = await findAuthUserId(member.email);
  if (!userId) {
    return NextResponse.json(
      { error: "Couldn't find their account to reset. Ask them to use 'forgot password'." },
      { status: 502 }
    );
  }

  const db = supabaseAdmin();
  const { error: updErr } = await db.auth.admin.updateUserById(userId, {
    password: tempPassword,
  });
  if (updErr) return NextResponse.json({ error: updErr.message }, { status: 502 });

  // Force the change-password screen again on next sign-in.
  await updateMember(id, { must_change_password: true });

  const mail = renderTeamInvite({
    email: member.email,
    tempPassword,
    roleName: member.role?.name ?? "Member",
    invitedBy: access.email,
  });
  let emailed = false;
  try {
    const { error } = await resend.emails.send({
      from: RESEND_FROM,
      to: member.email,
      replyTo: RESEND_REPLY_TO,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
    });
    emailed = !error;
  } catch {
    emailed = false;
  }

  await logMemberAction(access.email, "resend_invite", member.email);
  return NextResponse.json({ ok: true, email: member.email, tempPassword, emailed });
}
