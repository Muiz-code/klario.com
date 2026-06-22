/**
 * Builds a branded Klario email from plain, non-technical input. Used by the
 * compose studio's "Write" mode so admins can type a message without touching
 * HTML. Runs in the browser for live preview and produces the exact HTML that
 * gets sent. Uses the shared dark gold brand (logo header + Raavon footer).
 * Supports {{first_name}} and {{unsubscribe_url}} merge tags (left intact for
 * per-recipient filling).
 */
import { COLORS, wrapDocument } from "./brand";
import { inlineEmailStyles } from "./rich-to-email";

/**
 * Builds the full email from the rich-text editor's body HTML: inlines the
 * block styles, adds an optional CTA button, and wraps it in the brand shell.
 */
export function buildRichEmail(opts: {
  bodyHtml: string;
  subject?: string;
  ctaLabel?: string;
  ctaHref?: string;
}): string {
  const raw =
    opts.bodyHtml?.trim() ||
    `<p style="color:${COLORS.text};">Write your message...</p>`;

  // Always greet the recipient by name. If the writer didn't include the
  // {{first_name}} tag anywhere, prepend a greeting line so every composed
  // email is personalized. The tag is filled per recipient at send time
  // ("Hello Tomiwa," with a name; "Hello from Klario," when no name is on file).
  const hasName = /\{\{\s*first_name\s*\}\}/.test(raw);
  const greeting = hasName
    ? ""
    : `<p style="margin:0 0 16px;font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:1.6;color:${COLORS.text};">Hello {{first_name}},</p>`;

  const body = greeting + inlineEmailStyles(raw);

  const ctaLabel = (opts.ctaLabel || "").trim();
  const ctaHref = (opts.ctaHref || "").trim();
  const cta =
    ctaLabel && ctaHref
      ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:8px;"><tr><td style="border-radius:999px;background:${COLORS.gold};"><a href="${escapeAttr(
          ctaHref
        )}" target="_blank" style="display:inline-block;padding:14px 30px;font-family:Helvetica,Arial,sans-serif;font-size:15px;font-weight:700;color:${COLORS.ink};text-decoration:none;border-radius:999px;">${escapeHtml(
          ctaLabel
        )} &#8594;</a></td></tr></table>`
      : "";

  const inner = `<tr><td class="px" style="padding:42px 40px;font-family:Helvetica,Arial,sans-serif;">${body}${cta}</td></tr>`;
  return wrapDocument({
    preheader: opts.subject || "A note from Klario.",
    title: opts.subject || "Klario",
    inner,
  });
}

export type ComposeInput = {
  heading?: string;
  body: string;
  ctaLabel?: string;
  ctaHref?: string;
  images?: string[];
};

const F = "Helvetica,Arial,sans-serif";

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
        `<p style="margin:0 0 16px;font-family:${F};font-size:16px;line-height:1.6;color:${COLORS.text};">${escapeHtml(
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
    ? `<h1 class="h1" style="margin:0 0 16px;font-family:${F};font-size:28px;line-height:1.18;font-weight:800;letter-spacing:-0.5px;color:${COLORS.white};">${escapeHtml(
        heading
      )}</h1>`
    : "";

  const ctaBlock =
    ctaLabel && ctaHref
      ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:8px;"><tr><td style="border-radius:999px;background:${COLORS.gold};"><a href="${escapeAttr(
          ctaHref
        )}" target="_blank" style="display:inline-block;padding:14px 30px;font-family:${F};font-size:15px;font-weight:700;color:${COLORS.ink};text-decoration:none;border-radius:999px;">${escapeHtml(
          ctaLabel
        )} &#8594;</a></td></tr></table>`
      : "";

  const inner = `
  ${imageBlock}
  <tr><td class="px" style="padding:42px 40px;">
    ${headingBlock}
    ${paragraphs || `<p style="margin:0;font-family:${F};font-size:16px;line-height:1.6;color:${COLORS.text};">Write your message...</p>`}
    ${ctaBlock}
  </td></tr>`;

  return wrapDocument({
    preheader: heading || "A note from Klario.",
    title: heading || "Klario",
    inner,
  });
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
