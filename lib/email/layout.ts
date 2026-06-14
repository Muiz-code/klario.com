import {
  COLORS,
  wrapDocument,
  escapeHtml,
  escapeAttr,
} from "./brand";

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

  const eyebrowBlock = eyebrow
    ? `<p style="margin:0 0 16px 0;color:${COLORS.gold};font-family:Helvetica,Arial,sans-serif;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;">${escapeHtml(eyebrow)}</p>`
    : "";

  const ctaBlock = cta
    ? `<table role="presentation" cellspacing="0" cellpadding="0" border="0">
        <tr>
          <td align="center" style="background:${COLORS.gold};border-radius:999px;">
            <a href="${escapeAttr(cta.href)}" style="display:inline-block;padding:14px 28px;font-family:Helvetica,Arial,sans-serif;font-size:14px;font-weight:700;color:${COLORS.ink};text-decoration:none;border-radius:999px;">
              ${escapeHtml(cta.label)} &rarr;
            </a>
          </td>
        </tr>
      </table>`
    : "";

  const heroRow = `<tr>
    <td class="px" style="padding:46px 40px 32px 40px;">
      ${eyebrowBlock}
      <h1 class="h1" style="margin:0 0 18px 0;color:${COLORS.white};font-family:Helvetica,Arial,sans-serif;font-size:34px;line-height:1.12;font-weight:800;letter-spacing:-0.5px;">
        ${escapeHtml(heading)}
      </h1>
      <p style="margin:0 0 ${cta ? "28" : "8"}px 0;color:${COLORS.text};font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:1.6;">
        ${escapeHtml(intro)}
      </p>
      ${ctaBlock}
    </td>
  </tr>`;

  const stepsRow =
    steps && steps.length
      ? `<tr>
          <td style="padding:0 40px;">
            <div style="height:1px;background:${COLORS.border};line-height:1px;font-size:1px;">&nbsp;</div>
          </td>
        </tr>
        <tr>
          <td class="px" style="padding:36px 40px;">
            <h2 class="h2" style="margin:0 0 20px 0;color:${COLORS.white};font-family:Helvetica,Arial,sans-serif;font-size:22px;font-weight:800;letter-spacing:-0.3px;">
              What's next.
            </h2>
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              ${steps
                .map(
                  (s, i) => `<tr>
                    <td style="padding:${i === 0 ? "0" : "16px"} 0 ${i === steps.length - 1 ? "0" : "16px"} 0;${i < steps.length - 1 ? `border-bottom:1px solid ${COLORS.border};` : ""}">
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td valign="top" width="32" style="color:${COLORS.gold};font-family:Helvetica,Arial,sans-serif;font-size:13px;font-weight:700;padding-top:2px;">${pad(i + 1)}</td>
                          <td>
                            <p style="margin:0 0 4px 0;color:${COLORS.white};font-family:Helvetica,Arial,sans-serif;font-size:15px;font-weight:700;">${escapeHtml(s.title)}</p>
                            <p style="margin:0;color:${COLORS.textDim};font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:1.5;">${escapeHtml(s.body)}</p>
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
      : "";

  const closingRow = closing
    ? `<tr>
        <td class="px" style="padding:0 40px 36px 40px;">
          <p style="margin:0;color:${COLORS.textDim};font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;">
            ${escapeHtml(closing)}
          </p>
        </td>
      </tr>`
    : "";

  const taglineRow = tagline
    ? `<tr>
        <td align="center" style="background:${COLORS.cardAlt};padding:24px 32px;">
          <p style="margin:0;color:${COLORS.text};font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:15px;line-height:1.4;">
            ${escapeHtml(tagline.lead)} <span style="color:${COLORS.gold};">${escapeHtml(tagline.emphasis)}</span>
          </p>
        </td>
      </tr>`
    : "";

  return wrapDocument({
    preheader,
    title: heading,
    inner: `${heroRow}${stepsRow}${closingRow}${taglineRow}`,
    footer: { showUnsubscribe },
  });
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
  if (input.tagline) lines.push(`${input.tagline.lead} ${input.tagline.emphasis}`);
  lines.push("", "Klario Finance, klario.finance");
  return lines.join("\n");
}

function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}
