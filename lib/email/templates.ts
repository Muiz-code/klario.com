import { SITE } from "@/lib/constants";
import { renderLayout, renderText, type LayoutInput } from "./layout";

export type Email = {
  subject: string;
  html: string;
  text: string;
};

function build(input: LayoutInput, subject: string): Email {
  return {
    subject,
    html: renderLayout(input),
    text: renderText(input),
  };
}

export function newsletterWelcome(opts: { firstName?: string }): Email {
  const name = opts.firstName?.trim() || "there";
  return build(
    {
      preheader: "Your money, finally making sense. Welcome to the Klario letter.",
      eyebrow: "You're on the list",
      heading: `Welcome to Klario, ${name}.`,
      intro:
        "You just joined thousands of Nigerians waiting for the cleanest, smartest way to manage every naira. We'll only message you when there's something worth your time.",
      cta: { label: "Visit Klario", href: SITE.url },
      steps: [
        {
          title: "Early access invitation",
          body: "You'll be among the first to download Klario when we go live on iOS and Android.",
        },
        {
          title: "Money clarity, monthly",
          body: "One short letter a month with AI-driven money insights, naira tips, and Nigerian fintech moves.",
        },
        {
          title: "A founding-user perk",
          body: "Waitlist members get one free month of Money Manager when we launch. No card required.",
        },
      ],
      tagline: { lead: "Your money,", emphasis: "finally in your control." },
    },
    "Welcome to Klario, you're on the list"
  );
}

export function ambassadorConfirmation(opts: {
  firstName?: string;
  role?: "student" | "staff";
  institution?: string;
}): Email {
  const name = opts.firstName?.trim() || "there";
  const where = opts.institution ? ` at ${opts.institution}` : "";
  return build(
    {
      preheader: "Your Klario ambassador application is in. We'll respond within 7 days.",
      eyebrow: "Ambassador application received",
      heading: `Thanks, ${name}. We've got your application.`,
      intro: `We're excited to read about your community${where}. The team reviews ambassador applications weekly, and we'll be in touch within 7 days either way.`,
      cta: { label: "See ambassador perks", href: `${SITE.url}#ambassadors` },
      steps: [
        {
          title: "We review applications weekly",
          body: "Every application gets read by a real human. We look for energy, reach, and clarity of why you'd be great.",
        },
        {
          title: "You get a reply within 7 days",
          body: "Yes or no, you'll hear from us. If yes, we'll send onboarding, swag details, and your first campaign brief.",
        },
        {
          title: "You start earning",
          body: "Monthly stipend, Klario merch, a resume credit, and a direct line to the founders.",
        },
      ],
      tagline: { lead: "Rep Klario.", emphasis: "Get paid. Build skills." },
    },
    "Klario Ambassador application received"
  );
}

export function contactAcknowledgement(opts: {
  firstName?: string;
  topic?: string;
}): Email {
  const name = opts.firstName?.trim() || "there";
  const topicLine = opts.topic ? ` (${opts.topic.toLowerCase()})` : "";
  return build(
    {
      preheader: "We received your message. A real human will be in touch within two business days.",
      eyebrow: "Message received",
      heading: `Thanks, ${name}. We've got your note.`,
      intro: `We received your message${topicLine} and someone from the team will reach out within two business days. Press and partnership requests are routed directly to the founders.`,
      cta: { label: "Visit Klario", href: SITE.url },
      closing:
        "If your matter is urgent, you can reach us directly at hello@klario.finance.",
      tagline: { lead: "We read every word.", emphasis: "And we respond." },
      showUnsubscribe: false,
    },
    "We received your message | Klario"
  );
}

export function internalNotification(opts: {
  kind: "Beta" | "Ambassador" | "Contact" | "Newsletter";
  payload: Record<string, string | undefined>;
}): Email {
  const rows = Object.entries(opts.payload)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(
      ([k, v]) =>
        `<tr><td style="padding:8px 12px; border-bottom:1px solid #EFE5D2; font-weight:700; color:#0D0D0E; font-family:Helvetica,Arial,sans-serif; font-size:13px; text-transform:capitalize;">${escapeAttr(
          k
        )}</td><td style="padding:8px 12px; border-bottom:1px solid #EFE5D2; color:#3D3A35; font-family:Helvetica,Arial,sans-serif; font-size:13px;">${escapeAttr(
          String(v)
        )}</td></tr>`
    )
    .join("");

  const subject = `[Klario] New ${opts.kind} submission`;
  const html = `<!DOCTYPE html><html><body style="font-family: Helvetica, Arial, sans-serif; background:#F7F6F2; padding:24px;">
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="background:#FFFFFF; border:1px solid #EFE5D2; border-radius:12px; overflow:hidden; margin:0 auto;">
<tr><td style="background:#0D0D0E; padding:16px 24px; color:#F7F6F2; font-weight:700; font-size:14px;">${escapeAttr(subject)}</td></tr>
<tr><td style="padding:24px;"><table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">${rows}</table></td></tr>
</table></body></html>`;

  const text = Object.entries(opts.payload)
    .map(([k, v]) => `${k}: ${v ?? ""}`)
    .join("\n");

  return { subject, html, text };
}

function escapeAttr(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
