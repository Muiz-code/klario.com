import { renderNewsletter } from "./newsletter";
import { WELCOME_TEMPLATE_HTML } from "./welcome";
import { COLORS, wrapDocument } from "./brand";

export type GalleryTemplate = {
  id: string;
  name: string;
  description: string;
  subject: string;
  html: string;
};

/**
 * Starter templates for the compose studio. Each is full, editable HTML. The
 * admin picks one, edits the HTML (and subject), inserts images, then sends.
 * Supported merge tags: {{first_name}}, {{unsubscribe_url}}.
 */
export function galleryTemplates(): GalleryTemplate[] {
  const editorial = renderNewsletter({
    subject: "The Klario Letter",
    preheader: "Money clarity, monthly.",
    heading: "Hello {{first_name}}, here is this month's letter.",
    intro:
      "Write your update here. Keep it to one clear idea: the most useful thing a reader should take away this month.",
    ctaLabel: "Read more",
    ctaHref: "https://www.klario.finance",
    closing: "See you next month. Reply any time, a real person reads every email.",
  });

  const announcement = renderNewsletter({
    subject: "A quick update from Klario",
    preheader: "Something new from the Klario team.",
    heading: "We have news to share, {{first_name}}.",
    intro:
      "Use this space to announce a feature, a milestone, or an event. Short and direct works best.",
    ctaLabel: "See what's new",
    ctaHref: "https://www.klario.finance",
  });

  // A deliberately plain, text-first email. No logo banner, no buttons, no
  // multi-section tables - it reads like a personal note, which Gmail is far
  // more likely to file under Primary than Promotions. One inline link, one
  // unsubscribe link, light background, system font.
  const plain = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"></head>
<body style="margin:0;padding:0;background:#ffffff;">
<div style="font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:16px;line-height:1.6;color:#1a1a1a;max-width:560px;margin:0 auto;padding:28px 22px;">
  <p style="margin:0 0 16px;">Hi {{first_name}},</p>
  <p style="margin:0 0 16px;">Write your note here as if you're emailing one person - short, friendly, and to the point. A plain message like this is much more likely to land in the inbox.</p>
  <p style="margin:0 0 16px;">If you need them to do something, link it inline like <a href="https://www.klario.finance" style="color:#1a73e8;text-decoration:underline;">this</a> instead of using a big button.</p>
  <p style="margin:0 0 2px;">Thanks,</p>
  <p style="margin:0 0 28px;">Muiz · Klario</p>
  <p style="margin:0;font-size:12px;color:#9aa0a6;">You're receiving this because you joined Klario. <a href="{{unsubscribe_url}}" style="color:#9aa0a6;">Unsubscribe</a>.</p>
</div>
</body></html>`;

  // Full-bleed "poster" — one edge-to-edge image, no logo header, no greeting.
  // The whole image is clickable. Uses the shared brand shell so it still carries
  // the tagline + full Klario/Raavon signature footer. Just replace the image
  // src and the link.
  const poster = wrapDocument({
    preheader: "Your preview text here — the line inboxes show next to the subject.",
    title: "Klario",
    hideHeader: true,
    inner: `
      <!-- FULL-WIDTH IMAGE — replace the src (use the Image button) and the link href. -->
      <tr><td style="padding:0;line-height:0;font-size:0;">
        <a href="https://www.klario.finance" target="_blank" style="display:block;text-decoration:none;">
          <img src="https://placehold.co/600x820/1F232B/D4A853/png?text=Drop+your+full-width+image+here" alt="" width="600" style="display:block;width:100%;max-width:100%;height:auto;border:0;" />
        </a>
      </td></tr>
      <!-- Brand tagline strip (matches the newsletter sign-off). -->
      <tr><td align="center" style="background:${COLORS.cardAlt};padding:22px 32px;">
        <p style="margin:0;color:${COLORS.text};font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:15px;line-height:1.4;">connect · track · <span style="color:${COLORS.gold};">understand</span></p>
      </td></tr>`,
    footer: { showUnsubscribe: true },
  });

  const F = "Helvetica,Arial,sans-serif";

  // Anchor Club update — branded letter aimed at Anchor Club members.
  const anchor = wrapDocument({
    preheader: "An update for the Klario Anchor Club.",
    title: "Anchor Club update",
    inner: `<tr><td class="px" style="padding:26px 28px;font-family:${F};">
      <p style="margin:0 0 12px;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${COLORS.gold};">The Anchor Club</p>
      <h1 class="h1" style="margin:0 0 16px;font-size:28px;line-height:1.18;font-weight:800;letter-spacing:-0.5px;color:${COLORS.white};">Hi {{first_name}}, an update from the club</h1>
      <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:${COLORS.text};">Write your update to the Anchor Club here — cohort news, a call to action, or the next steps you want members to take.</p>
      <p style="margin:0;font-size:15px;line-height:1.6;color:${COLORS.text};">Build with us, not for us.<br/>The Klario team</p>
    </td></tr>`,
  });

  const blank = wrapDocument({
    preheader: "A note from Klario.",
    title: "A note from Klario",
    inner: `<tr><td class="px" style="padding:42px 40px;font-family:${F};">
      <h1 class="h1" style="margin:0 0 16px;font-size:28px;line-height:1.18;font-weight:800;letter-spacing:-0.5px;color:${COLORS.white};">Hi {{first_name}},</h1>
      <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:${COLORS.text};">Write your message here. You can edit this HTML directly, add images, links and buttons, and change anything you like.</p>
      <p style="margin:0;font-size:16px;line-height:1.6;color:${COLORS.text};">The Klario team</p>
    </td></tr>`,
  });

  return [
    {
      id: "plain",
      name: "Plain note (best for inbox)",
      description:
        "Minimal, text-first email that's far more likely to land in Primary, not Promotions.",
      subject: "A quick note",
      html: plain,
    },
    {
      id: "anchor",
      name: "Anchor Club update",
      description: "A branded letter for Anchor Club members.",
      subject: "An update from the Anchor Club",
      html: anchor,
    },
    {
      id: "poster",
      name: "Full-image poster (flyer)",
      description:
        "One edge-to-edge image — no logo, no greeting, no padding. For a designed flyer/banner. Replace the image and its link.",
      subject: "",
      html: poster,
    },
    {
      id: "editorial",
      name: "Editorial letter",
      description: "The branded monthly letter layout with a CTA button.",
      subject: "The Klario Letter",
      html: editorial,
    },
    {
      id: "announcement",
      name: "Announcement",
      description: "A short, punchy update for a feature or milestone.",
      subject: "A quick update from Klario",
      html: announcement,
    },
    {
      id: "blank",
      name: "Simple letter",
      description: "A clean, minimal shell you can fill however you want.",
      subject: "A note from Klario",
      html: blank,
    },
    {
      id: "welcome",
      name: "Beta welcome (copy)",
      description: "Start from the full beta welcome design and tweak it.",
      subject: "Welcome to the Klario beta",
      html: WELCOME_TEMPLATE_HTML,
    },
  ];
}
