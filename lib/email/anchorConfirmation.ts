/**
 * Anchor Club application confirmation. Sent automatically after a successful
 * /anchor-club submission. Shares the Klario brand wrapper (logo header +
 * gold-on-charcoal body + Raavon footer) and includes the applicant's Anchor
 * reference and the app link.
 */
import { COLORS, wrapDocument, escapeHtml } from "./brand";
import { renderButtonRow, buttonsText, type EmailButton } from "./linkButtons";
import { APP_LINKS } from "@/lib/constants";

const F = "Helvetica,Arial,sans-serif";

export type RenderedEmail = { subject: string; html: string; text: string };

const STORE_BUTTONS: EmailButton[] = [
  { label: "Download on iOS", url: APP_LINKS.ios, variant: "primary" },
  { label: "Get on Android", url: APP_LINKS.android, variant: "outline" },
];

export function renderAnchorConfirmation(opts: {
  name?: string | null;
  ref: string;
  email: string;
}): RenderedEmail {
  const name = (opts.name || "").trim() || "there";
  const ref = opts.ref;

  const inner = `
  <tr>
    <td class="px" style="padding:44px 40px 8px 40px;">
      <p style="margin:0 0 14px 0;font-family:${F};font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${COLORS.gold};">
        Application received
      </p>
      <h1 class="h1" style="margin:0 0 18px 0;font-family:${F};font-size:30px;line-height:1.18;font-weight:800;letter-spacing:-0.6px;color:${COLORS.white};">
        Hi ${escapeHtml(name)}, we've got your Anchor Club application
      </h1>
      <p style="margin:0 0 16px 0;font-family:${F};font-size:16px;line-height:1.6;color:${COLORS.text};">
        Thanks for stepping up. The Anchor Club is for people who want to
        actually build something &mdash; real product experience, mentorship, and
        first access to the Klario beta.
      </p>
      <p style="margin:0 0 16px 0;font-family:${F};font-size:16px;line-height:1.6;color:${COLORS.text};">
        We read every application by hand. If you're a fit for the founding
        cohort, you'll hear from us on WhatsApp within about two weeks, and we'll
        bring you into the cohort group from there.
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
              Your Anchor Club reference
            </p>
            <p style="margin:0;font-family:${F};font-size:22px;font-weight:800;letter-spacing:1px;color:${COLORS.gold};">
              ${escapeHtml(ref)}
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- Get the app CTA -->
  <tr>
    <td class="px" style="padding:18px 40px 6px 40px;">
      <p style="margin:0 0 14px 0;font-family:${F};font-size:15px;line-height:1.6;color:${COLORS.text};">
        In the meantime, get the Klario app and create your account with this same
        email &mdash; that's how we link your Anchor profile to your progress.
      </p>
      ${renderButtonRow(STORE_BUTTONS)}
    </td>
  </tr>

  <!-- Sign off -->
  <tr>
    <td class="px" style="padding:24px 40px 36px 40px;">
      <p style="margin:0 0 2px 0;font-family:${F};font-size:15px;line-height:1.5;color:${COLORS.text};">Build with us, not for us.</p>
      <p style="margin:0 0 2px 0;font-family:${F};font-size:15px;line-height:1.5;color:${COLORS.white};font-weight:700;">The Klario team</p>
      <p style="margin:6px 0 0 0;font-family:${F};font-size:13px;line-height:1.5;color:${COLORS.muted};">
        Klario, a Raavon Limited venture &middot; Lagos, Nigeria
      </p>
    </td>
  </tr>`;

  const html = wrapDocument({
    preheader: "We've received your Klario Anchor Club application. Here's your reference.",
    title: "We've got your Anchor Club application",
    inner,
    footer: {
      showUnsubscribe: false,
      reason: "You're receiving this because you applied to the Klario Anchor Club.",
    },
  });

  const text = `Hi ${name},

Thanks for stepping up. The Anchor Club is for people who want to actually build something — real product experience, mentorship, and first access to the Klario beta.

We read every application by hand. If you're a fit for the founding cohort, you'll hear from us on WhatsApp within about two weeks, and we'll bring you into the cohort group from there.

Your Anchor Club reference: ${ref}

Get the Klario app and sign up with this same email so we can link your Anchor profile to your progress:${buttonsText(STORE_BUTTONS)}

Build with us, not for us.
The Klario team
Klario, a Raavon Limited venture · Lagos, Nigeria`;

  return {
    subject: "We've got your Anchor Club application",
    html,
    text,
  };
}
