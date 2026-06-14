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
