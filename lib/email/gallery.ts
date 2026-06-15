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
  // multi-section tables — it reads like a personal note, which Gmail is far
  // more likely to file under Primary than Promotions. One inline link, one
  // unsubscribe link, light background, system font.
  const plain = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"></head>
<body style="margin:0;padding:0;background:#ffffff;">
<div style="font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:16px;line-height:1.6;color:#1a1a1a;max-width:560px;margin:0 auto;padding:28px 22px;">
  <p style="margin:0 0 16px;">Hi {{first_name}},</p>
  <p style="margin:0 0 16px;">Write your note here as if you're emailing one person — short, friendly, and to the point. A plain message like this is much more likely to land in the inbox.</p>
  <p style="margin:0 0 16px;">If you need them to do something, link it inline like <a href="https://www.klario.finance" style="color:#1a73e8;text-decoration:underline;">this</a> instead of using a big button.</p>
  <p style="margin:0 0 2px;">Thanks,</p>
  <p style="margin:0 0 28px;">Muiz · Klario</p>
  <p style="margin:0;font-size:12px;color:#9aa0a6;">You're receiving this because you joined Klario. <a href="{{unsubscribe_url}}" style="color:#9aa0a6;">Unsubscribe</a>.</p>
</div>
</body></html>`;

  const F = "Helvetica,Arial,sans-serif";
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
