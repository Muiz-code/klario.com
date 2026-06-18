/**
 * Beta questionnaire confirmation email. Sent automatically after a successful
 * /beta submission. Brand: Klario logo header + gold-on-charcoal body + Raavon
 * footer (shared wrapDocument). Includes the respondent's beta reference.
 */
import { COLORS, wrapDocument, escapeHtml } from "./brand";
import { betaVerifyUrl } from "./links";
import { SITE } from "@/lib/constants";

const F = "Helvetica,Arial,sans-serif";

export type RenderedEmail = { subject: string; html: string; text: string };

export function renderBetaConfirmation(opts: {
  name?: string | null;
  ref: string;
  email: string;
  occupation?: string | null;
}): RenderedEmail {
  const name = (opts.name || "").trim() || "there";
  const ref = opts.ref;
  const verifyUrl = betaVerifyUrl(opts.email);
  const referralUrl = `${SITE.url}/beta?ref=${encodeURIComponent(ref)}`;
  const isStudent = (opts.occupation || "").toLowerCase() === "student";

  // The referral reward is for students only.
  const referralBlock = isStudent
    ? `
  <tr>
    <td class="px" style="padding:18px 40px 6px 40px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLORS.cardAlt};border:1px solid ${COLORS.border};border-radius:14px;">
        <tr>
          <td style="padding:18px 22px;">
            <p style="margin:0 0 6px 0;font-family:${F};font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:${COLORS.gold};">
              Students: refer and earn
            </p>
            <p style="margin:0 0 12px 0;font-family:${F};font-size:15px;line-height:1.6;color:${COLORS.text};">
              Refer 10 friends who join and confirm their email, and you get
              &#8358;500 airtime, or convert it to cash. Share your invite link
              to start.
            </p>
            <p style="margin:0 0 4px 0;font-family:${F};font-size:12px;letter-spacing:0.5px;text-transform:uppercase;color:${COLORS.textDim};">
              Your invite link
            </p>
            <p style="margin:0;font-family:${F};font-size:15px;font-weight:700;word-break:break-all;">
              <a href="${referralUrl}" style="color:${COLORS.gold};text-decoration:none;">${escapeHtml(referralUrl)}</a>
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>`
    : "";

  const inner = `
  <tr>
    <td class="px" style="padding:44px 40px 8px 40px;">
      <p style="margin:0 0 14px 0;font-family:${F};font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${COLORS.gold};">
        You're on the list
      </p>
      <h1 class="h1" style="margin:0 0 18px 0;font-family:${F};font-size:30px;line-height:1.18;font-weight:800;letter-spacing:-0.6px;color:${COLORS.white};">
        Hi ${escapeHtml(name)}, we've got your beta request
      </h1>
      <p style="margin:0 0 16px 0;font-family:${F};font-size:16px;line-height:1.6;color:${COLORS.text};">
        Thanks for signing up for the Klario beta. We've received your response.
      </p>
      <p style="margin:0 0 16px 0;font-family:${F};font-size:16px;line-height:1.6;color:${COLORS.text};">
        We read every single one, and the money problems you just told us about
        are exactly the ones we're building Klario to solve. We'll be in touch as
        soon as your spot opens.
      </p>
    </td>
  </tr>

  <!-- Reference card -->
  <tr>
    <td class="px" style="padding:8px 40px 8px 40px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLORS.cardAlt};border:1px solid ${COLORS.border};border-radius:14px;">
        <tr>
          <td style="padding:18px 22px;">
            <p style="margin:0 0 4px 0;font-family:${F};font-size:12px;letter-spacing:0.5px;text-transform:uppercase;color:${COLORS.textDim};">
              Your beta reference
            </p>
            <p style="margin:0;font-family:${F};font-size:22px;font-weight:800;letter-spacing:1px;color:${COLORS.gold};">
              ${escapeHtml(ref)}
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- Verify CTA -->
  <tr>
    <td class="px" style="padding:18px 40px 6px 40px;">
      <p style="margin:0 0 14px 0;font-family:${F};font-size:15px;line-height:1.6;color:${COLORS.text};">
        One quick thing: confirm your email so we know it's really you and can
        lock in your spot.
      </p>
      <table role="presentation" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center" style="border-radius:999px;background:${COLORS.gold};">
            <a href="${verifyUrl}" target="_blank" style="display:inline-block;padding:14px 32px;font-family:${F};font-size:15px;font-weight:700;color:${COLORS.ink};text-decoration:none;border-radius:999px;">Confirm my email</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- Referral (students only) -->
  ${referralBlock}

  <!-- Sign off -->
  <tr>
    <td class="px" style="padding:24px 40px 36px 40px;">
      <p style="margin:0 0 2px 0;font-family:${F};font-size:15px;line-height:1.5;color:${COLORS.text};">Talk soon,</p>
      <p style="margin:0 0 2px 0;font-family:${F};font-size:15px;line-height:1.5;color:${COLORS.white};font-weight:700;">The Klario team</p>
      <p style="margin:6px 0 0 0;font-family:${F};font-size:13px;line-height:1.5;color:${COLORS.muted};">
        Klario, a Raavon Limited venture &middot; Lagos, Nigeria
      </p>
    </td>
  </tr>`;

  const html = wrapDocument({
    preheader: "We've received your Klario beta response. Here's your reference.",
    title: "We've got your Klario beta request",
    inner,
    footer: {
      showUnsubscribe: false,
      reason: "You're receiving this because you requested access to the Klario beta.",
    },
  });

  const text = `Hi ${name},

Thanks for signing up for the Klario beta. We've received your response.

We read every single one, and the money problems you just told us about are exactly the ones we're building Klario to solve. We'll be in touch as soon as your spot opens.

Your beta reference: ${ref}

Confirm your email to lock in your spot: ${verifyUrl}
${
  isStudent
    ? `
Students: refer 10 friends who join and confirm their email, and you get NGN 500 airtime (or convert it to cash).
Your invite link: ${referralUrl}
`
    : ""
}
Talk soon,
The Klario team
Klario, a Raavon Limited venture · Lagos, Nigeria`;

  return {
    subject: "We've got your Klario beta request",
    html,
    text,
  };
}
