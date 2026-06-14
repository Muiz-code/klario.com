/**
 * Beta welcome email. Dark gold-on-charcoal theme matching the rest of the
 * Klario emails, with three merge tags replaced per recipient before sending:
 *   {{first_name}}, {{cta_url}}, {{unsubscribe_url}}
 */
import { unsubscribeUrl } from "./links";
import { COLORS, wrapDocument } from "./brand";

const F = "Helvetica,Arial,sans-serif";

const WELCOME_INNER = `
  <!-- Hero -->
  <tr>
    <td class="px" style="padding:44px 40px 8px 40px;">
      <p style="margin:0 0 14px 0;font-family:${F};font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${COLORS.gold};">
        You're in, {{first_name}}
      </p>
      <h1 class="h1" style="margin:0 0 16px 0;font-family:${F};font-size:32px;line-height:1.18;font-weight:800;letter-spacing:-0.8px;color:${COLORS.white};">
        See every naira, across every account, in one clear place.
      </h1>
      <p style="margin:0;font-family:${F};font-size:16px;line-height:1.6;color:${COLORS.text};">
        Thank you for signing up to test Klario. You are officially on the beta list, ahead of everyone else.
      </p>
    </td>
  </tr>

  <!-- Balance card -->
  <tr>
    <td class="px" style="padding:28px 40px 8px 40px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLORS.cardAlt};border:1px solid ${COLORS.border};border-radius:18px;">
        <tr>
          <td style="padding:26px 26px 22px 26px;">
            <p style="margin:0 0 6px 0;font-family:${F};font-size:12px;letter-spacing:0.5px;color:${COLORS.textDim};">Total balance, all accounts</p>
            <p style="margin:0 0 20px 0;font-family:${F};font-size:38px;font-weight:800;letter-spacing:-1px;color:${COLORS.white};">&#8358;842,500<span style="color:${COLORS.gold};">.00</span></p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:10px 0;border-top:1px solid ${COLORS.border};font-family:${F};font-size:14px;color:${COLORS.textDim};">UBA</td>
                <td align="right" style="padding:10px 0;border-top:1px solid ${COLORS.border};font-family:${F};font-size:14px;font-weight:600;color:${COLORS.white};">&#8358;510,000</td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-top:1px solid ${COLORS.border};font-family:${F};font-size:14px;color:${COLORS.textDim};">PalmPay</td>
                <td align="right" style="padding:10px 0;border-top:1px solid ${COLORS.border};font-family:${F};font-size:14px;font-weight:600;color:${COLORS.white};">&#8358;212,500</td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-top:1px solid ${COLORS.border};font-family:${F};font-size:14px;color:${COLORS.textDim};">Opay</td>
                <td align="right" style="padding:10px 0;border-top:1px solid ${COLORS.border};font-family:${F};font-size:14px;font-weight:600;color:${COLORS.white};">&#8358;120,000</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      <p style="margin:10px 2px 0 2px;font-family:${F};font-size:12px;line-height:1.5;color:${COLORS.muted};font-style:italic;">A preview of your Klario home screen.</p>
    </td>
  </tr>

  <!-- What is Klario -->
  <tr>
    <td class="px" style="padding:30px 40px 6px 40px;">
      <h2 class="h2" style="margin:0 0 12px 0;font-family:${F};font-size:20px;font-weight:800;letter-spacing:-0.4px;color:${COLORS.white};">So, what is Klario?</h2>
      <p style="margin:0;font-family:${F};font-size:15px;line-height:1.7;color:${COLORS.text};">
        Klario is an AI powered personal finance app built for Nigerians. You connect your bank accounts once, then Klario brings everything together: your real balance, where your money actually goes, and clear guidance on what to do next. No more checking five apps and still feeling lost.
      </p>
    </td>
  </tr>

  <!-- Features -->
  <tr>
    <td class="px" style="padding:22px 40px 8px 40px;">
      ${feature("&#128179;", "All your accounts, one screen", "Link every bank and wallet and see your true total balance instantly, updated in real time.")}
      ${feature("&#129504;", "AI that explains your money", "Klario reads your spending and tells you, in plain words, where it went and how to stay on track.")}
      ${feature("&#127919;", "Budgets that actually hold", "Set limits per week or month and get a nudge before you overspend, not after.")}
    </td>
  </tr>

  <!-- Security strip -->
  <tr>
    <td class="px" style="padding:22px 40px 8px 40px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLORS.cardAlt};border:1px solid ${COLORS.border};border-radius:14px;">
        <tr>
          <td style="padding:18px 20px;font-family:${F};font-size:13px;line-height:1.6;color:${COLORS.text};">
            &#128274; <strong style="color:${COLORS.white};">Your security comes first.</strong> Klario connects through licensed, bank grade open banking. We use read only access, your login details are never stored, and you can disconnect any account at any time.
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- What happens next -->
  <tr>
    <td class="px" style="padding:26px 40px 6px 40px;">
      <h2 class="h2" style="margin:0 0 12px 0;font-family:${F};font-size:20px;font-weight:800;letter-spacing:-0.4px;color:${COLORS.white};">What happens next</h2>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="padding:6px 0;font-family:${F};font-size:14px;line-height:1.6;color:${COLORS.text};"><span style="color:${COLORS.gold};font-weight:800;">1.</span>&nbsp;&nbsp;We send your download link and access code shortly.</td></tr>
        <tr><td style="padding:6px 0;font-family:${F};font-size:14px;line-height:1.6;color:${COLORS.text};"><span style="color:${COLORS.gold};font-weight:800;">2.</span>&nbsp;&nbsp;You use Klario freely and tell us what works and what does not.</td></tr>
        <tr><td style="padding:6px 0;font-family:${F};font-size:14px;line-height:1.6;color:${COLORS.text};"><span style="color:${COLORS.gold};font-weight:800;">3.</span>&nbsp;&nbsp;Your feedback shapes what we build before public launch.</td></tr>
      </table>
    </td>
  </tr>

  <!-- CTA -->
  <tr>
    <td class="px" align="center" style="padding:26px 40px 36px 40px;">
      <table role="presentation" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center" style="border-radius:999px;background:${COLORS.gold};">
            <a href="{{cta_url}}" target="_blank" style="display:inline-block;padding:15px 36px;font-family:${F};font-size:15px;font-weight:700;color:${COLORS.ink};text-decoration:none;border-radius:999px;">Get my early access &#8594;</a>
          </td>
        </tr>
      </table>
      <p style="margin:16px 0 0 0;font-family:${F};font-size:13px;line-height:1.5;color:${COLORS.muted};">
        Questions? Just reply to this email, a real person reads every one.
      </p>
    </td>
  </tr>

  <!-- Sign off -->
  <tr>
    <td class="px" style="padding:0 40px 36px 40px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="border-top:1px solid ${COLORS.border};padding-top:22px;">
          <p style="margin:0 0 2px 0;font-family:${F};font-size:14px;line-height:1.5;color:${COLORS.white};">Muiz Owolabi</p>
          <p style="margin:0;font-family:${F};font-size:13px;line-height:1.5;color:${COLORS.muted};">Founder, Klario &nbsp;&middot;&nbsp; A Raavon company</p>
        </td></tr>
      </table>
    </td>
  </tr>
`;

function feature(icon: string, title: string, body: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px;">
    <tr>
      <td width="48" valign="top" style="padding-right:14px;">
        <div style="width:44px;height:44px;background:${COLORS.cardAlt};border:1px solid ${COLORS.border};border-radius:12px;text-align:center;line-height:44px;font-size:20px;">${icon}</div>
      </td>
      <td valign="top">
        <p style="margin:0 0 3px 0;font-family:${F};font-size:15px;font-weight:700;color:${COLORS.white};">${title}</p>
        <p style="margin:0;font-family:${F};font-size:14px;line-height:1.6;color:${COLORS.textDim};">${body}</p>
      </td>
    </tr>
  </table>`;
}

const WELCOME_HTML = wrapDocument({
  preheader: "Every naira, every account, in one clear place. Your beta access is ready.",
  title: "Welcome to the Klario beta",
  inner: WELCOME_INNER,
  footer: {
    showUnsubscribe: true,
    reason: "You are receiving this because you signed up for the Klario beta.",
  },
});

const WELCOME_TEXT = `You're in, {{first_name}}.

See every naira, across every account, in one clear place.

Thank you for signing up to test Klario. You are officially on the beta list, ahead of everyone else.

What is Klario?
Klario is an AI powered personal finance app built for Nigerians. Connect your bank accounts once and Klario brings everything together: your real balance, where your money goes, and clear guidance on what to do next.

What happens next:
1. We send your download link and access code shortly.
2. You use Klario freely and tell us what works and what does not.
3. Your feedback shapes what we build before public launch.

Get your early access: {{cta_url}}

Questions? Just reply to this email, a real person reads every one.

Muiz Owolabi, Founder, Klario (a Raavon company)
Klario by Raavon Limited (RC 9537604), Lagos, Nigeria.
Unsubscribe: {{unsubscribe_url}}`;

/** Raw template with merge tags intact, for client-side live preview. */
export const WELCOME_TEMPLATE_HTML = WELCOME_HTML;

function fillTags(
  template: string,
  vars: { firstName: string; ctaUrl: string; unsubscribeUrl: string }
): string {
  return template
    .replace(/\{\{\s*first_name\s*\}\}/g, vars.firstName)
    .replace(/\{\{\s*cta_url\s*\}\}/g, vars.ctaUrl)
    .replace(/\{\{\s*unsubscribe_url\s*\}\}/g, vars.unsubscribeUrl);
}

export type RenderedWelcome = { html: string; text: string };

/**
 * Render the welcome email for one recipient. The unsubscribe link is derived
 * from the email and signed. For a fake preview (no real recipient) pass a
 * placeholder email; the link still renders but is not meant to be clicked.
 */
export function renderWelcome(opts: {
  email: string;
  firstName?: string | null;
  ctaUrl: string;
}): RenderedWelcome {
  const firstName = (opts.firstName || "").trim() || "there";
  const vars = {
    firstName: escapeHtml(firstName),
    ctaUrl: opts.ctaUrl,
    unsubscribeUrl: unsubscribeUrl(opts.email),
  };
  return {
    html: fillTags(WELCOME_HTML, vars),
    text: fillTags(WELCOME_TEXT, { ...vars, firstName }),
  };
}

/** Preview render with sample data and no signing requirement. */
export function previewWelcome(opts: {
  firstName: string;
  ctaUrl: string;
}): string {
  return fillTags(WELCOME_HTML, {
    firstName: escapeHtml(opts.firstName || "there"),
    ctaUrl: opts.ctaUrl,
    unsubscribeUrl: "#preview-unsubscribe",
  });
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
