/**
 * Generic branded email for the re-engage / win-back automations. The admin
 * supplies a subject and a plain-text body (blank lines separate paragraphs);
 * this wraps it in the shared Klario shell with a single CTA button.
 */
import { unsubscribeUrl } from "./links";
import { COLORS, wrapDocument, escapeHtml } from "./brand";

const F = "Helvetica,Arial,sans-serif";

function paragraphs(body: string): string {
  const blocks = body
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);
  if (blocks.length === 0) return "";
  return blocks
    .map(
      (b) =>
        `<p style="margin:0 0 16px 0;font-family:${F};font-size:16px;line-height:1.6;color:${COLORS.text};">${escapeHtml(
          b
        ).replace(/\n/g, "<br/>")}</p>`
    )
    .join("\n");
}

export type RenderedAutomation = { html: string; text: string };

export function renderAutomationEmail(opts: {
  email: string;
  firstName?: string | null;
  subject: string;
  body: string;
  ctaUrl: string;
  ctaLabel?: string;
}): RenderedAutomation {
  const firstName = (opts.firstName || "").trim() || "there";
  const ctaLabel = opts.ctaLabel || "Open Klario";
  const unsub = unsubscribeUrl(opts.email);

  const inner = `
  <tr>
    <td class="px" style="padding:44px 40px 8px 40px;">
      <p style="margin:0 0 14px 0;font-family:${F};font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${COLORS.gold};">
        Hi ${escapeHtml(firstName)}
      </p>
      <h1 class="h1" style="margin:0 0 20px 0;font-family:${F};font-size:28px;line-height:1.2;font-weight:800;letter-spacing:-0.6px;color:${COLORS.white};">
        ${escapeHtml(opts.subject)}
      </h1>
      ${paragraphs(opts.body)}
    </td>
  </tr>
  <tr>
    <td class="px" align="center" style="padding:14px 40px 40px 40px;">
      <table role="presentation" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center" style="border-radius:999px;background:${COLORS.gold};">
            <a href="${opts.ctaUrl}" target="_blank" style="display:inline-block;padding:15px 36px;font-family:${F};font-size:15px;font-weight:700;color:${COLORS.ink};text-decoration:none;border-radius:999px;">${escapeHtml(
              ctaLabel
            )} &#8594;</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>`;

  const html = wrapDocument({
    preheader: opts.subject,
    title: opts.subject,
    inner,
    footer: {
      showUnsubscribe: true,
      unsubscribeHref: unsub,
      reason: "You are receiving this because you joined the Klario beta list.",
    },
  });

  const text = `Hi ${firstName},

${opts.body}

${ctaLabel}: ${opts.ctaUrl}

Unsubscribe: ${unsub}`;

  return { html, text };
}
