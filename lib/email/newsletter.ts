import { renderLayout } from "./layout";

export type NewsletterInput = {
  subject: string;
  preheader?: string;
  heading: string;
  intro: string;
  ctaLabel?: string;
  ctaHref?: string;
  closing?: string;
};

/**
 * Render a newsletter to HTML using the shared editorial email layout. The
 * unsubscribe link in the footer is templated as {{unsubscribe_url}} and filled
 * in per recipient at send time.
 */
export function renderNewsletter(input: NewsletterInput): string {
  return renderLayout({
    preheader: input.preheader || input.subject,
    eyebrow: "The Klario Letter",
    heading: input.heading,
    intro: input.intro,
    cta:
      input.ctaLabel && input.ctaHref
        ? { label: input.ctaLabel, href: input.ctaHref }
        : undefined,
    closing: input.closing,
    tagline: { lead: "Money clarity,", emphasis: "monthly." },
  });
}
