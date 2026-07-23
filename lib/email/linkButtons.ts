/**
 * A row of link buttons for brand emails — App Store, Google Play, WhatsApp
 * group, or any custom link. Rendered as nested tables (email-safe) so they sit
 * side by side. "primary" = gold fill, "outline" = gold hairline. Icons/logos
 * are intentionally omitted: inline SVG is stripped by Gmail and Apple-glyph
 * fallbacks box on Android, so clear text labels are the reliable choice.
 */
import { COLORS } from "./brand";

const F = "Helvetica,Arial,sans-serif";

export type EmailButton = {
  label: string;
  url: string;
  variant?: "primary" | "outline";
};

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function escapeAttr(s: string) {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

function cleanButtons(buttons: EmailButton[]): EmailButton[] {
  return buttons
    .map((b) => ({
      label: (b.label || "").trim(),
      url: (b.url || "").trim(),
      variant: b.variant === "outline" ? ("outline" as const) : ("primary" as const),
    }))
    .filter((b) => b.label && /^https?:\/\//i.test(b.url));
}

/** One or more buttons, side by side, inside a padded email row. "" if none. */
export function renderButtonRow(buttons: EmailButton[]): string {
  const clean = cleanButtons(buttons);
  if (clean.length === 0) return "";

  const cells = clean
    .map((b) => {
      const primary = b.variant !== "outline";
      const bg = primary ? COLORS.gold : "transparent";
      const color = primary ? COLORS.ink : COLORS.white;
      const border = primary ? "none" : `1px solid ${COLORS.gold}`;
      return `<td style="padding:6px 10px 6px 0;">
        <table role="presentation" cellpadding="0" cellspacing="0"><tr>
          <td style="border-radius:999px;background:${bg};border:${border};">
            <a href="${escapeAttr(b.url)}" target="_blank" style="display:inline-block;padding:13px 26px;font-family:${F};font-size:15px;font-weight:700;color:${color};text-decoration:none;border-radius:999px;">${escapeHtml(
              b.label
            )}</a>
          </td>
        </tr></table>
      </td>`;
    })
    .join("");

  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:10px;"><tr>${cells}</tr></table>`;
}

/** Plain-text equivalent for the text/plain part. */
export function buttonsText(buttons: EmailButton[]): string {
  const clean = cleanButtons(buttons);
  if (clean.length === 0) return "";
  return "\n" + clean.map((b) => `${b.label}: ${b.url}`).join("\n");
}
