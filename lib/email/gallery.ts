import { renderNewsletter } from "./newsletter";
import { WELCOME_TEMPLATE_HTML } from "./welcome";

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

  const blank = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;background:#ECEAE3;font-family:'Segoe UI',Helvetica,Arial,sans-serif;color:#0E1116;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ECEAE3;"><tr><td align="center" style="padding:28px 12px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;background:#fff;border-radius:20px;overflow:hidden;">
  <tr><td style="background:#0E1116;padding:22px 40px;font-size:22px;font-weight:800;color:#fff;">Klario<span style="color:#19C37D;">.</span></td></tr>
  <tr><td style="padding:40px;">
    <h1 style="margin:0 0 16px;font-size:28px;font-weight:800;color:#0E1116;">Hi {{first_name}},</h1>
    <p style="margin:0 0 16px;font-size:16px;line-height:26px;color:#4A5159;">Write your message here. You can edit this HTML directly, add images, and change anything you like.</p>
    <p style="margin:0;font-size:16px;line-height:26px;color:#4A5159;">The Klario team</p>
  </td></tr>
  <tr><td style="background:#0E1116;padding:20px 40px;font-size:12px;color:#7E8794;">
    Klario by Raavon Limited. <a href="{{unsubscribe_url}}" style="color:#19C37D;">Unsubscribe</a>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;

  return [
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
