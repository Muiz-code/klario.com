import { NextResponse } from "next/server";
import {
  createNewsletter,
  type NewsletterAttachment,
} from "@/lib/db/newsletters";
import { renderNewsletter } from "@/lib/email/newsletter";
import { logAction } from "@/lib/db/adminActivity";

export const runtime = "nodejs";

/**
 * Create (draft) a newsletter campaign. Two ways to supply the body:
 *  - Raw:    { subject, html }                      -> stored verbatim
 *  - Guided: { subject, heading, intro, ... }       -> rendered via the layout
 * The actual batch send happens via /api/admin/newsletters/[id]/send.
 */
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const subject = str(body.subject, 200);
  if (!subject) {
    return NextResponse.json({ error: "Subject is required." }, { status: 400 });
  }

  let html = "";
  const rawHtml = str(body.html, 200000);

  if (rawHtml) {
    html = rawHtml;
  } else {
    const heading = str(body.heading, 200);
    const intro = str(body.intro, 8000);
    if (!heading || !intro) {
      return NextResponse.json(
        { error: "Provide html, or heading and intro." },
        { status: 400 }
      );
    }
    html = renderNewsletter({
      subject,
      preheader: str(body.preheader, 200) || subject,
      heading,
      intro,
      ctaLabel: str(body.ctaLabel, 80) || undefined,
      ctaHref: str(body.ctaHref, 500) || undefined,
      closing: str(body.closing, 4000) || undefined,
    });
  }

  const attachments: NewsletterAttachment[] = Array.isArray(body.attachments)
    ? body.attachments
        .filter((a): a is Record<string, unknown> => !!a && typeof a === "object")
        .map((a) => ({
          filename: str(a.filename, 200) || "attachment.pdf",
          url: str(a.url, 1000),
        }))
        .filter((a) => /^https?:\/\//i.test(a.url))
        .slice(0, 5)
    : [];

  const created = await createNewsletter({ subject, html, attachments });
  if (!created) {
    return NextResponse.json({ error: "Could not save newsletter." }, { status: 502 });
  }
  await logAction("mail.create", { target: subject });
  return NextResponse.json({ ok: true, id: created.id });
}

function str(v: unknown, max: number): string {
  if (typeof v !== "string") return "";
  return v.trim().slice(0, max);
}
