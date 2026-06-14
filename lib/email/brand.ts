import { SITE } from "@/lib/constants";

/**
 * Shared email brand system: one gold-on-charcoal palette, one logo header, and
 * one rich Raavon footer, used by every Klario email so they look consistent.
 */
export const COLORS = {
  pageBg: "#0A0B0D", // outer page behind the card
  card: "#16181D", // charcoal card body
  cardAlt: "#1F232B", // raised panels inside the card
  header: "#FFFFFF", // white header strip
  ink: "#0E1116", // dark text on light surfaces
  white: "#FFFFFF", // headings on dark
  text: "#C2C7CF", // body copy on dark
  textDim: "#9AA0AA", // secondary copy
  muted: "#7E8794", // footer copy
  gold: "#D4A853", // Raavon gold accent
  goldDeep: "#B98D3E",
  border: "#272B33", // hairlines on dark
} as const;

const LOGO_URL = `${SITE.url}/klarioLogoDark.png`;

/** White header strip with the Klario logo, centered. */
export function emailHeaderRow(): string {
  return `<tr>
    <td align="center" style="background:${COLORS.header};padding:24px 32px;">
      <img src="${LOGO_URL}" alt="Klario" width="122" height="27" style="display:block;border:0;outline:none;text-decoration:none;height:27px;width:122px;" />
    </td>
  </tr>`;
}

/** Charcoal footer rows (inside the card): Raavon credit, disclaimer, links. */
export function emailFooterRows(opts?: {
  showUnsubscribe?: boolean;
  reason?: string;
  unsubscribeHref?: string;
}): string {
  const showUnsub = opts?.showUnsubscribe ?? true;
  const unsubHref = opts?.unsubscribeHref ?? "{{unsubscribe_url}}";
  const reason = opts?.reason;

  return `<tr>
    <td style="padding:0 40px;">
      <div style="height:1px;background:${COLORS.border};line-height:1px;font-size:1px;">&nbsp;</div>
    </td>
  </tr>
  <tr>
    <td align="center" style="padding:28px 40px 34px 40px;background:${COLORS.card};">
      <p style="margin:0 0 8px 0;font-family:Helvetica,Arial,sans-serif;font-size:12px;line-height:1.7;color:${COLORS.muted};">
        <strong style="color:${COLORS.text};">${escapeHtml(SITE.legalName)}</strong>
        &nbsp;&middot;&nbsp; Powered by
        <a href="${escapeAttr(SITE.poweredBy.url)}" style="color:${COLORS.gold};text-decoration:none;">${escapeHtml(SITE.poweredBy.brand)}</a>
        &nbsp;&middot;&nbsp; ${escapeHtml(SITE.poweredBy.rc)}
      </p>
      <p style="margin:0 0 14px 0;font-family:Helvetica,Arial,sans-serif;font-size:12px;line-height:1.7;color:${COLORS.muted};">
        Klario is not a bank. We are a financial intelligence platform.
      </p>
      ${
        reason
          ? `<p style="margin:0 0 14px 0;font-family:Helvetica,Arial,sans-serif;font-size:12px;line-height:1.7;color:${COLORS.muted};">${escapeHtml(reason)}</p>`
          : ""
      }
      <p style="margin:0 0 16px 0;font-family:Helvetica,Arial,sans-serif;font-size:12px;">
        <a href="${escapeAttr(SITE.url)}" style="color:${COLORS.gold};text-decoration:none;font-weight:600;">klario.finance</a>
      </p>
      <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:${COLORS.muted};">
        ${showUnsub ? `<a href="${escapeAttr(unsubHref)}" style="color:${COLORS.muted};text-decoration:underline;">Unsubscribe</a> &nbsp;&middot;&nbsp; ` : ""}<a href="${escapeAttr(SITE.url)}/privacy" style="color:${COLORS.muted};text-decoration:underline;">Privacy</a>
        &nbsp;&middot;&nbsp;
        <a href="${escapeAttr(SITE.url)}/terms" style="color:${COLORS.muted};text-decoration:underline;">Terms</a>
      </p>
    </td>
  </tr>`;
}

/**
 * Wraps inner card rows in the full document: outer page, charcoal card, logo
 * header, the caller's rows, then the shared footer.
 */
export function wrapDocument(opts: {
  preheader: string;
  title?: string;
  inner: string;
  footer?: { showUnsubscribe?: boolean; reason?: string; unsubscribeHref?: string };
}): string {
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="dark">
  <meta name="supported-color-schemes" content="dark">
  <meta name="x-apple-disable-message-reformatting">
  <title>${escapeHtml(opts.title || "Klario")}</title>
  <style>
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    a { color: inherit; }
    @media only screen and (max-width: 620px) {
      .container { width: 100% !important; max-width: 100% !important; border-radius: 0 !important; }
      .px { padding-left: 24px !important; padding-right: 24px !important; }
      .h1 { font-size: 28px !important; line-height: 1.15 !important; }
      .h2 { font-size: 20px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:${COLORS.pageBg};font-family:Helvetica,Arial,sans-serif;color:${COLORS.text};-webkit-font-smoothing:antialiased;">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:${COLORS.pageBg};">
    ${escapeHtml(opts.preheader)}
  </div>
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:${COLORS.pageBg};">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" class="container" cellspacing="0" cellpadding="0" border="0" width="600" style="width:600px;max-width:600px;background:${COLORS.card};border:1px solid ${COLORS.border};border-radius:18px;overflow:hidden;">
          ${emailHeaderRow()}
          ${opts.inner}
          ${emailFooterRows(opts.footer)}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function escapeAttr(s: string): string {
  return escapeHtml(s);
}
