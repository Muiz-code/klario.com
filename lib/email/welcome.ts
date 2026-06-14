/**
 * Beta welcome email. The HTML below is the approved template, verbatim, with
 * three merge tags that are replaced per recipient before sending:
 *   {{first_name}}, {{cta_url}}, {{unsubscribe_url}}
 */
import { unsubscribeUrl } from "./links";

const WELCOME_HTML = `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title>Welcome to the Klario beta</title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
  <style>
    @media only screen and (max-width:600px){
      .container{width:100% !important}
      .px{padding-left:24px !important;padding-right:24px !important}
      .h1{font-size:28px !important;line-height:34px !important}
      .stack{display:block !important;width:100% !important}
      .stack-pad{padding:0 0 16px 0 !important}
      .balance{font-size:34px !important}
    }
    a{text-decoration:none}
  </style>
</head>
<body style="margin:0;padding:0;background-color:#ECEAE3;-webkit-font-smoothing:antialiased;">
  <!-- preheader (hidden) -->
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#ECEAE3;font-size:1px;line-height:1px;">
    Every naira, every account, in one clear place. Your beta access is ready.
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#ECEAE3;">
    <tr><td align="center" style="padding:28px 12px;">

      <table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;background-color:#FFFFFF;border-radius:20px;overflow:hidden;box-shadow:0 8px 30px rgba(14,17,22,0.10);">

        <!-- Header -->
        <tr>
          <td class="px" style="background-color:#0E1116;padding:22px 40px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="left" style="font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:22px;font-weight:800;letter-spacing:-0.5px;color:#FFFFFF;">
                  Klario<span style="color:#19C37D;">.</span>
                </td>
                <td align="right" style="font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:11px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:#7E8794;">
                  Private Beta
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Hero -->
        <tr>
          <td class="px" style="padding:44px 40px 8px 40px;">
            <p style="margin:0 0 14px 0;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#19C37D;">
              You're in, {{first_name}}
            </p>
            <h1 class="h1" style="margin:0 0 16px 0;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:34px;line-height:40px;font-weight:800;letter-spacing:-1px;color:#0E1116;">
              See every naira, across every account, in one clear place.
            </h1>
            <p style="margin:0;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:16px;line-height:26px;color:#4A5159;">
              Thank you for signing up to test Klario. You are officially on the beta list, ahead of everyone else.
            </p>
          </td>
        </tr>

        <!-- Balance card graphic (inline CSS, no image needed) -->
        <tr>
          <td class="px" style="padding:28px 40px 8px 40px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#0E1116 0%,#1A2230 100%);background-color:#0E1116;border-radius:18px;">
              <tr>
                <td style="padding:26px 26px 22px 26px;">
                  <p style="margin:0 0 6px 0;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:12px;letter-spacing:0.5px;color:#8A929E;">Total balance, all accounts</p>
                  <p class="balance" style="margin:0 0 20px 0;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:40px;font-weight:800;letter-spacing:-1px;color:#FFFFFF;">&#8358;842,500<span style="color:#19C37D;">.00</span></p>

                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding:10px 0;border-top:1px solid rgba(255,255,255,0.08);font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:14px;color:#C9CED6;">UBA</td>
                      <td align="right" style="padding:10px 0;border-top:1px solid rgba(255,255,255,0.08);font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:14px;font-weight:600;color:#FFFFFF;">&#8358;510,000</td>
                    </tr>
                    <tr>
                      <td style="padding:10px 0;border-top:1px solid rgba(255,255,255,0.08);font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:14px;color:#C9CED6;">PalmPay</td>
                      <td align="right" style="padding:10px 0;border-top:1px solid rgba(255,255,255,0.08);font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:14px;font-weight:600;color:#FFFFFF;">&#8358;212,500</td>
                    </tr>
                    <tr>
                      <td style="padding:10px 0;border-top:1px solid rgba(255,255,255,0.08);font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:14px;color:#C9CED6;">Opay</td>
                      <td align="right" style="padding:10px 0;border-top:1px solid rgba(255,255,255,0.08);font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:14px;font-weight:600;color:#FFFFFF;">&#8358;120,000</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
            <p style="margin:10px 2px 0 2px;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:12px;line-height:18px;color:#9AA0A8;font-style:italic;">A preview of your Klario home screen.</p>
          </td>
        </tr>

        <!-- What is Klario -->
        <tr>
          <td class="px" style="padding:30px 40px 6px 40px;">
            <h2 style="margin:0 0 12px 0;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:20px;font-weight:800;letter-spacing:-0.4px;color:#0E1116;">So, what is Klario?</h2>
            <p style="margin:0;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:15px;line-height:25px;color:#4A5159;">
              Klario is an AI powered personal finance app built for Nigerians. You connect your bank accounts once, then Klario brings everything together: your real balance, where your money actually goes, and clear guidance on what to do next. No more checking five apps and still feeling lost.
            </p>
          </td>
        </tr>

        <!-- Features -->
        <tr>
          <td class="px" style="padding:22px 40px 8px 40px;">

            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px;">
              <tr>
                <td width="48" valign="top" style="padding-right:14px;">
                  <div style="width:44px;height:44px;background-color:#E7FAF1;border-radius:12px;text-align:center;line-height:44px;font-size:20px;">&#128179;</div>
                </td>
                <td valign="top">
                  <p style="margin:0 0 3px 0;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:15px;font-weight:700;color:#0E1116;">All your accounts, one screen</p>
                  <p style="margin:0;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:14px;line-height:22px;color:#5A616A;">Link every bank and wallet and see your true total balance instantly, updated in real time.</p>
                </td>
              </tr>
            </table>

            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px;">
              <tr>
                <td width="48" valign="top" style="padding-right:14px;">
                  <div style="width:44px;height:44px;background-color:#E7FAF1;border-radius:12px;text-align:center;line-height:44px;font-size:20px;">&#129504;</div>
                </td>
                <td valign="top">
                  <p style="margin:0 0 3px 0;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:15px;font-weight:700;color:#0E1116;">AI that explains your money</p>
                  <p style="margin:0;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:14px;line-height:22px;color:#5A616A;">Klario reads your spending and tells you, in plain words, where it went and how to stay on track.</p>
                </td>
              </tr>
            </table>

            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:6px;">
              <tr>
                <td width="48" valign="top" style="padding-right:14px;">
                  <div style="width:44px;height:44px;background-color:#E7FAF1;border-radius:12px;text-align:center;line-height:44px;font-size:20px;">&#127919;</div>
                </td>
                <td valign="top">
                  <p style="margin:0 0 3px 0;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:15px;font-weight:700;color:#0E1116;">Budgets that actually hold</p>
                  <p style="margin:0;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:14px;line-height:22px;color:#5A616A;">Set limits per week or month and get a nudge before you overspend, not after.</p>
                </td>
              </tr>
            </table>

          </td>
        </tr>

        <!-- Security strip -->
        <tr>
          <td class="px" style="padding:22px 40px 8px 40px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F4F6F4;border-radius:14px;">
              <tr>
                <td style="padding:18px 20px;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:13px;line-height:21px;color:#3E4651;">
                  &#128274; <strong>Your security comes first.</strong> Klario connects through licensed, bank grade open banking. We use read only access, your login details are never stored, and you can disconnect any account at any time.
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- What happens next -->
        <tr>
          <td class="px" style="padding:26px 40px 6px 40px;">
            <h2 style="margin:0 0 12px 0;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:20px;font-weight:800;letter-spacing:-0.4px;color:#0E1116;">What happens next</h2>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr><td style="padding:6px 0;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:14px;line-height:22px;color:#4A5159;"><span style="color:#19C37D;font-weight:800;">1.</span>&nbsp;&nbsp;We send your download link and access code shortly.</td></tr>
              <tr><td style="padding:6px 0;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:14px;line-height:22px;color:#4A5159;"><span style="color:#19C37D;font-weight:800;">2.</span>&nbsp;&nbsp;You use Klario freely and tell us what works and what does not.</td></tr>
              <tr><td style="padding:6px 0;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:14px;line-height:22px;color:#4A5159;"><span style="color:#19C37D;font-weight:800;">3.</span>&nbsp;&nbsp;Your feedback shapes what we build before public launch.</td></tr>
            </table>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td class="px" align="center" style="padding:26px 40px 40px 40px;">
            <table role="presentation" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center" style="border-radius:12px;background-color:#19C37D;">
                  <a href="{{cta_url}}" target="_blank" style="display:inline-block;padding:15px 38px;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:15px;font-weight:700;color:#0E1116;border-radius:12px;">Get my early access &#8594;</a>
                </td>
              </tr>
            </table>
            <p style="margin:16px 0 0 0;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:13px;line-height:20px;color:#8A909A;">
              Questions? Just reply to this email, a real person reads every one.
            </p>
          </td>
        </tr>

        <!-- Sign off -->
        <tr>
          <td class="px" style="padding:0 40px 36px 40px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr><td style="border-top:1px solid #EAEBED;padding-top:22px;">
                <p style="margin:0 0 2px 0;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:14px;line-height:22px;color:#0E1116;">Muiz Owolabi</p>
                <p style="margin:0;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:13px;line-height:20px;color:#8A909A;">Founder, Klario &nbsp;&middot;&nbsp; A Raavon company</p>
              </td></tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background-color:#0E1116;padding:24px 40px;">
            <p style="margin:0 0 6px 0;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:12px;line-height:18px;color:#7E8794;">
              Klario by Raavon Limited (RC 9537604), Lagos, Nigeria.
            </p>
            <p style="margin:0;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:12px;line-height:18px;color:#5C636D;">
              You are receiving this because you signed up for the Klario beta. <a href="{{unsubscribe_url}}" style="color:#19C37D;">Unsubscribe</a>
            </p>
          </td>
        </tr>

      </table>

    </td></tr>
  </table>
</body>
</html>`;

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
