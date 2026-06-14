/**
 * Builds a branded Klario email from plain, non-technical input. Used by the
 * compose studio's "Write" mode so admins can type a message without touching
 * HTML. Pure and import-free, so it runs in the browser for live preview and
 * produces the exact HTML that gets sent. Supports {{first_name}} and
 * {{unsubscribe_url}} merge tags (left intact for per-recipient filling).
 */
export type ComposeInput = {
  heading?: string;
  body: string;
  ctaLabel?: string;
  ctaHref?: string;
  images?: string[];
};

export function buildEmailHtml(input: ComposeInput): string {
  const heading = (input.heading || "").trim();
  const ctaLabel = (input.ctaLabel || "").trim();
  const ctaHref = (input.ctaHref || "").trim();
  const images = (input.images || []).map((u) => u.trim()).filter(Boolean);

  const paragraphs = input.body
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map(
      (p) =>
        `<p style="margin:0 0 16px;font-size:16px;line-height:26px;color:#4A5159;">${escapeHtml(
          p
        ).replace(/\n/g, "<br/>")}</p>`
    )
    .join("\n");

  const imageBlock = images
    .map(
      (url) =>
        `<tr><td style="padding:0 40px 12px;"><img src="${escapeAttr(
          url
        )}" alt="" style="display:block;width:100%;height:auto;border-radius:14px;" /></td></tr>`
    )
    .join("\n");

  const headingBlock = heading
    ? `<h1 style="margin:0 0 16px;font-size:28px;line-height:34px;font-weight:800;letter-spacing:-0.5px;color:#0E1116;">${escapeHtml(
        heading
      )}</h1>`
    : "";

  const ctaBlock =
    ctaLabel && ctaHref
      ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:8px;"><tr><td style="border-radius:12px;background:#19C37D;"><a href="${escapeAttr(
          ctaHref
        )}" target="_blank" style="display:inline-block;padding:14px 30px;font-size:15px;font-weight:700;color:#0E1116;text-decoration:none;border-radius:12px;">${escapeHtml(
          ctaLabel
        )} &#8594;</a></td></tr></table>`
      : "";

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;background:#ECEAE3;font-family:'Segoe UI',Helvetica,Arial,sans-serif;color:#0E1116;-webkit-font-smoothing:antialiased;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ECEAE3;"><tr><td align="center" style="padding:28px 12px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 8px 30px rgba(14,17,22,0.10);">
  <tr><td style="background:#0E1116;padding:22px 40px;font-size:22px;font-weight:800;color:#fff;">Klario<span style="color:#19C37D;">.</span></td></tr>
  ${imageBlock}
  <tr><td style="padding:40px;">
    ${headingBlock}
    ${paragraphs || `<p style="margin:0;font-size:16px;line-height:26px;color:#4A5159;">Write your message...</p>`}
    ${ctaBlock}
  </td></tr>
  <tr><td style="background:#0E1116;padding:20px 40px;font-size:12px;line-height:18px;color:#7E8794;">
    Klario by Raavon Limited (RC 9537604), Lagos, Nigeria.<br/>
    <a href="{{unsubscribe_url}}" style="color:#19C37D;text-decoration:underline;">Unsubscribe</a>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttr(s: string) {
  return escapeHtml(s).replace(/"/g, "&quot;");
}
