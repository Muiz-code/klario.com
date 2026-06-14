import { SITE } from "@/lib/constants";

type Step = { title: string; body: string };

export type LayoutInput = {
  preheader: string;
  eyebrow?: string;
  heading: string;
  intro: string;
  cta?: { label: string; href: string };
  steps?: Step[];
  closing?: string;
  tagline?: { lead: string; emphasis: string };
  showUnsubscribe?: boolean;
};

const COLORS = {
  bg: "#F7F6F2",
  card: "#FFFFFF",
  ink: "#0D0D0E",
  text: "#3D3A35",
  gold: "#D4A853",
  goldDeep: "#7A6332",
  border: "#EFE5D2",
  muted: "#6F6A60",
};

export function renderLayout(input: LayoutInput): string {
  const {
    preheader,
    eyebrow,
    heading,
    intro,
    cta,
    steps,
    closing,
    tagline,
    showUnsubscribe = true,
  } = input;

  const siteUrl = SITE.url;
  const brand = SITE.legalName;
  const rc = SITE.poweredBy.rc;

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>${escapeHtml(heading)}</title>
  <style>
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    a { color: inherit; }
    @media only screen and (max-width: 620px) {
      .container { width: 100% !important; max-width: 100% !important; border-radius: 0 !important; }
      .padded { padding: 32px 24px !important; }
      .top-padded { padding: 36px 24px 24px 24px !important; }
      .footer-padded { padding: 28px 24px 16px 24px !important; }
      .h1 { font-size: 28px !important; line-height: 1.15 !important; }
      .h2 { font-size: 20px !important; }
      .p { font-size: 15px !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background:${COLORS.bg}; font-family: Helvetica, Arial, sans-serif; color:${COLORS.text}; -webkit-font-smoothing:antialiased;">
  <div style="display:none; max-height:0; overflow:hidden; mso-hide:all; font-size:1px; line-height:1px; color:${COLORS.bg};">
    ${escapeHtml(preheader)}
  </div>

  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:${COLORS.bg};">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table role="presentation" class="container" cellspacing="0" cellpadding="0" border="0" width="600" style="width:600px; max-width:600px; background:${COLORS.card}; border:1px solid ${COLORS.border}; border-radius:16px; overflow:hidden;">
          <tr>
            <td align="center" style="background:${COLORS.ink}; padding: 22px 32px;">
              <span style="font-family: Helvetica, Arial, sans-serif; font-weight: 800; font-size: 22px; letter-spacing: -0.5px;">
                <span style="color:${COLORS.bg};">Kla</span><span style="color:${COLORS.gold};">rio</span><span style="color:${COLORS.goldDeep};">.</span>
              </span>
            </td>
          </tr>

          <tr>
            <td class="top-padded" style="padding: 48px 40px 32px 40px;">
              ${
                eyebrow
                  ? `<p style="margin:0 0 16px 0; color:${COLORS.gold}; font-family:Helvetica,Arial,sans-serif; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:2px;">${escapeHtml(eyebrow)}</p>`
                  : ""
              }
              <h1 class="h1" style="margin:0 0 18px 0; color:${COLORS.ink}; font-family:Helvetica,Arial,sans-serif; font-size:36px; line-height:1.1; font-weight:800; letter-spacing:-0.5px;">
                ${escapeHtml(heading)}
              </h1>
              <p class="p" style="margin:0 0 ${cta ? "28" : "8"}px 0; color:${COLORS.text}; font-family:Helvetica,Arial,sans-serif; font-size:16px; line-height:1.55;">
                ${escapeHtml(intro)}
              </p>
              ${
                cta
                  ? `<table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center" style="background:${COLORS.gold}; border-radius:999px;">
                    <a href="${escapeAttr(cta.href)}" style="display:inline-block; padding:14px 28px; font-family:Helvetica,Arial,sans-serif; font-size:14px; font-weight:600; color:${COLORS.ink}; text-decoration:none; border-radius:999px;">
                      ${escapeHtml(cta.label)} &rarr;
                    </a>
                  </td>
                </tr>
              </table>`
                  : ""
              }
            </td>
          </tr>

          ${
            steps && steps.length
              ? `<tr>
            <td style="padding: 0 40px;">
              <div style="height:1px; background:${COLORS.border}; line-height:1px; font-size:1px;">&nbsp;</div>
            </td>
          </tr>
          <tr>
            <td class="padded" style="padding: 36px 40px;">
              <h2 class="h2" style="margin:0 0 20px 0; color:${COLORS.ink}; font-family:Helvetica,Arial,sans-serif; font-size:22px; font-weight:800; letter-spacing:-0.3px;">
                What's next.
              </h2>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                ${steps
                  .map(
                    (s, i) => `<tr>
                  <td style="padding: ${i === 0 ? "0" : "16px"} 0 ${i === steps.length - 1 ? "0" : "16px"} 0; ${i < steps.length - 1 ? `border-bottom:1px solid ${COLORS.border};` : ""}">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td valign="top" width="32" style="color:${COLORS.gold}; font-family:Helvetica,Arial,sans-serif; font-size:13px; font-weight:700; padding-top:2px;">${pad(i + 1)}</td>
                        <td>
                          <p style="margin:0 0 4px 0; color:${COLORS.ink}; font-family:Helvetica,Arial,sans-serif; font-size:15px; font-weight:700;">${escapeHtml(s.title)}</p>
                          <p style="margin:0; color:${COLORS.text}; font-family:Helvetica,Arial,sans-serif; font-size:14px; line-height:1.5;">${escapeHtml(s.body)}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>`
                  )
                  .join("")}
              </table>
            </td>
          </tr>`
              : ""
          }

          ${
            closing
              ? `<tr>
            <td class="padded" style="padding: 0 40px 36px 40px;">
              <p class="p" style="margin:0; color:${COLORS.text}; font-family:Helvetica,Arial,sans-serif; font-size:15px; line-height:1.55;">
                ${escapeHtml(closing)}
              </p>
            </td>
          </tr>`
              : ""
          }

          ${
            tagline
              ? `<tr>
            <td align="center" style="background:${COLORS.bg}; padding: 24px 32px;">
              <p style="margin:0; color:${COLORS.text}; font-family:Georgia, 'Times New Roman', serif; font-style:italic; font-size:15px; line-height:1.4;">
                ${escapeHtml(tagline.lead)} <span style="color:${COLORS.gold};">${escapeHtml(tagline.emphasis)}</span>
              </p>
            </td>
          </tr>`
              : ""
          }
        </table>

        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" class="container" style="width:600px; max-width:600px;">
          <tr>
            <td align="center" class="footer-padded" style="padding: 32px 24px 16px 24px; color:${COLORS.muted}; font-family:Helvetica,Arial,sans-serif; font-size:11px; line-height:1.7;">
              <p style="margin: 0 0 8px 0;">
                <strong style="color:${COLORS.ink};">${escapeHtml(brand)}</strong>
                &nbsp;&middot;&nbsp; Powered by
                <a href="${escapeAttr(SITE.poweredBy.url)}" style="color:${COLORS.text}; text-decoration:underline;">${escapeHtml(SITE.poweredBy.brand)}</a>
                &nbsp;&middot;&nbsp; ${escapeHtml(rc)}
              </p>
              <p style="margin: 0 0 16px 0;">
                Klario is not a bank. We are a financial intelligence platform.
              </p>
              <p style="margin: 0 0 16px 0;">
                <a href="${escapeAttr(siteUrl)}" style="color:${COLORS.gold}; text-decoration:none; font-weight:600;">klario.finance</a>
              </p>
              <p style="margin: 0; font-size:10px; letter-spacing:1.5px; text-transform:uppercase;">
                ${showUnsubscribe ? `<a href="{{unsubscribe_url}}" style="color:${COLORS.muted}; text-decoration:underline;">Unsubscribe</a> &nbsp;&middot;&nbsp; ` : ""}<a href="${escapeAttr(siteUrl)}/privacy" style="color:${COLORS.muted}; text-decoration:underline;">Privacy</a>
                &nbsp;&middot;&nbsp;
                <a href="${escapeAttr(siteUrl)}/terms" style="color:${COLORS.muted}; text-decoration:underline;">Terms</a>
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function renderText(input: LayoutInput): string {
  const lines: string[] = [];
  if (input.eyebrow) lines.push(input.eyebrow.toUpperCase(), "");
  lines.push(input.heading, "");
  lines.push(input.intro, "");
  if (input.cta) lines.push(`${input.cta.label}: ${input.cta.href}`, "");
  if (input.steps && input.steps.length) {
    lines.push("What's next:", "");
    input.steps.forEach((s, i) => {
      lines.push(`${pad(i + 1)}. ${s.title}`);
      lines.push(`    ${s.body}`, "");
    });
  }
  if (input.closing) lines.push(input.closing, "");
  if (input.tagline) lines.push(`— ${input.tagline.lead} ${input.tagline.emphasis}`);
  lines.push("", "Klario Finance · klario.finance");
  return lines.join("\n");
}

function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttr(s: string) {
  return escapeHtml(s);
}
