import { COLORS } from "./brand";

/**
 * Converts the rich-text editor's HTML into email-safe HTML by adding inline
 * styles to block elements (so it renders consistently across mail clients)
 * while preserving the inline styles the editor already sets for font family,
 * size, color, alignment, and image positioning.
 *
 * Runs in the browser (uses DOMParser). On the server it returns the input
 * unchanged, which is fine because compose builds HTML client-side.
 */
const F = "Helvetica,Arial,sans-serif";

const TAG_STYLES: Record<string, string> = {
  h1: `margin:0 0 16px;font-family:${F};font-size:28px;line-height:1.2;font-weight:800;letter-spacing:-0.5px;color:${COLORS.white};`,
  h2: `margin:0 0 12px;font-family:${F};font-size:21px;line-height:1.3;font-weight:700;color:${COLORS.white};`,
  h3: `margin:0 0 10px;font-family:${F};font-size:17px;line-height:1.3;font-weight:700;color:${COLORS.white};`,
  p: `margin:0 0 16px;font-family:${F};font-size:16px;line-height:1.6;color:${COLORS.text};`,
  ul: `margin:0 0 16px;padding-left:22px;font-family:${F};font-size:16px;line-height:1.6;color:${COLORS.text};`,
  ol: `margin:0 0 16px;padding-left:22px;font-family:${F};font-size:16px;line-height:1.6;color:${COLORS.text};`,
  li: `margin:0 0 6px;`,
  a: `color:${COLORS.gold};text-decoration:underline;`,
  blockquote: `margin:0 0 16px;padding:8px 0 8px 16px;border-left:3px solid ${COLORS.gold};font-family:${F};font-size:16px;line-height:1.6;color:${COLORS.textDim};font-style:italic;`,
};

export function inlineEmailStyles(html: string): string {
  if (typeof window === "undefined" || typeof DOMParser === "undefined") {
    return html;
  }

  const doc = new DOMParser().parseFromString(
    `<div id="rte-root">${html}</div>`,
    "text/html"
  );
  const root = doc.getElementById("rte-root");
  if (!root) return html;

  root.querySelectorAll<HTMLElement>("*").forEach((el) => {
    el.removeAttribute("contenteditable");
    el.removeAttribute("class");

    const tag = el.tagName.toLowerCase();
    const existing = el.getAttribute("style") || "";

    if (tag === "img") {
      // Keep author sizing/alignment; just guarantee it never overflows.
      if (!/max-width/i.test(existing)) {
        el.setAttribute("style", `max-width:100%;height:auto;${existing}`);
      }
      el.setAttribute("border", "0");
      return;
    }

    const base = TAG_STYLES[tag];
    if (base) {
      // Base first, author style last so the author's choices win.
      el.setAttribute("style", base + existing);
    }
  });

  return root.innerHTML;
}
