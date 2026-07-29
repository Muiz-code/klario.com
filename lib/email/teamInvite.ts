import { COLORS, wrapDocument, escapeHtml } from "./brand";
import { SITE } from "@/lib/constants";

const F = "Helvetica,Arial,sans-serif";

/**
 * Invite email for a new admin team member: their temporary password and the
 * link to sign in. They're forced to set a new password on first login.
 */
export function renderTeamInvite(opts: {
  email: string;
  /** Null for an existing account — they keep their current password. */
  tempPassword: string | null;
  roleName: string;
  invitedBy?: string | null;
}): { subject: string; html: string; text: string } {
  const loginUrl = `${SITE.url}/marketing?email=${encodeURIComponent(opts.email)}`;

  // Credential block: temp password for new accounts, "use your existing
  // password" for people who already have a Klario account.
  const credRow = opts.tempPassword
    ? `<tr>
    <td class="px" style="padding:6px 40px 8px 40px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLORS.cardAlt};border:1px solid ${COLORS.border};border-radius:14px;">
        <tr><td style="padding:18px 22px;">
          <p style="margin:0 0 4px 0;font-family:${F};font-size:12px;letter-spacing:0.5px;text-transform:uppercase;color:${COLORS.textDim};">Email</p>
          <p style="margin:0 0 14px 0;font-family:${F};font-size:15px;color:${COLORS.white};">${escapeHtml(opts.email)}</p>
          <p style="margin:0 0 4px 0;font-family:${F};font-size:12px;letter-spacing:0.5px;text-transform:uppercase;color:${COLORS.textDim};">Temporary password</p>
          <p style="margin:0;font-family:'Courier New',monospace;font-size:20px;font-weight:700;letter-spacing:1px;color:${COLORS.gold};">${escapeHtml(opts.tempPassword)}</p>
        </td></tr>
      </table>
    </td>
  </tr>`
    : `<tr>
    <td class="px" style="padding:6px 40px 8px 40px;">
      <p style="margin:0;font-family:${F};font-size:15px;line-height:1.6;color:${COLORS.text};">
        You already have a Klario account (<strong style="color:${COLORS.white};">${escapeHtml(opts.email)}</strong>) — just sign in with your existing password.
      </p>
    </td>
  </tr>`;

  const inner = `
  <tr>
    <td class="px" style="padding:40px 40px 8px 40px;">
      <p style="margin:0 0 12px 0;font-family:${F};font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${COLORS.gold};">You've been invited</p>
      <h1 class="h1" style="margin:0 0 16px 0;font-family:${F};font-size:28px;line-height:1.2;font-weight:800;color:${COLORS.white};">Access to the Klario admin</h1>
      <p style="margin:0 0 16px 0;font-family:${F};font-size:16px;line-height:1.6;color:${COLORS.text};">
        You've been added as <strong style="color:${COLORS.white};">${escapeHtml(opts.roleName)}</strong>${
          opts.invitedBy ? ` by ${escapeHtml(opts.invitedBy)}` : ""
        }. ${
          opts.tempPassword
            ? "Use the temporary password below to sign in — you'll set your own password right after."
            : "Sign in with your existing Klario password."
        }
      </p>
    </td>
  </tr>
  ${credRow}
  <tr>
    <td class="px" style="padding:14px 40px 6px 40px;">
      <table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="border-radius:999px;background:${COLORS.gold};">
        <a href="${loginUrl}" target="_blank" style="display:inline-block;padding:14px 30px;font-family:${F};font-size:15px;font-weight:700;color:${COLORS.ink};text-decoration:none;border-radius:999px;">Sign in &#8594;</a>
      </td></tr></table>
    </td>
  </tr>
  <tr>
    <td class="px" style="padding:16px 40px 36px 40px;">
      <p style="margin:0;font-family:${F};font-size:13px;line-height:1.6;color:${COLORS.muted};">
        ${
          opts.tempPassword
            ? "For security, this password only works until you set a new one. "
            : ""
        }If you didn't expect this invite, you can ignore this email.
      </p>
    </td>
  </tr>`;

  const html = wrapDocument({
    preheader: "Your Klario admin invite.",
    title: "Your Klario admin invite",
    inner,
    footer: { showUnsubscribe: false, reason: "You're receiving this because you were invited to the Klario admin." },
  });

  const text = `You've been invited to the Klario admin as ${opts.roleName}.

Email: ${opts.email}
${opts.tempPassword ? `Temporary password: ${opts.tempPassword}` : "Sign in with your existing Klario password."}

Sign in: ${loginUrl}
${opts.tempPassword ? "\nYou'll be asked to set your own password right after signing in. This temporary password stops working once you do." : ""}`;

  return { subject: "Your Klario admin invite", html, text };
}
