import { NextResponse } from "next/server";
import { getAdminEmail } from "@/lib/supabase/server";
import { listTestUsers } from "@/lib/db/testUsers";
import { createNewsletter, markNewsletterSending } from "@/lib/db/newsletters";
import { enqueueRecipients, getQueueCounts } from "@/lib/db/newsletterQueue";
import { createAuditEvent } from "@/lib/db/audit";

export const runtime = "nodejs";
export const maxDuration = 120;

/**
 * Fire a load-test campaign at ALL test users at once, through the real send
 * pipeline (queue → batches → background worker), so it exercises exactly what a
 * real blast does — but only to safe resend.dev addresses. Returns the newsletter
 * id so the UI can watch it drain with the normal progress modal.
 */
export async function POST() {
  if (!(await getAdminEmail())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await listTestUsers();
  if (users.length === 0) {
    return NextResponse.json(
      { error: "No test users yet. Create some first." },
      { status: 400 }
    );
  }

  const stamp = new Date().toISOString().slice(0, 16).replace("T", " ");
  const newsletter = await createNewsletter({
    subject: `🧪 Load test — ${stamp}`,
    html: `<div style="font-family:sans-serif;padding:24px">
      <h2>Klario load test</h2>
      <p>Hi {{first_name}}, this is an automated pipeline test. No action needed.</p>
      <p style="color:#888;font-size:12px">Unsubscribe: {{unsubscribe_url}}</p>
    </div>`,
  });
  if (!newsletter) {
    return NextResponse.json({ error: "Could not create test draft." }, { status: 502 });
  }

  await enqueueRecipients(
    newsletter.id,
    users.map((u) => ({ email: u.email, first_name: u.first_name, signup_id: null }))
  );
  const counts = await getQueueCounts(newsletter.id);
  if (counts.total === 0) {
    return NextResponse.json(
      {
        error:
          "Couldn't queue. The send queue isn't set up — run migration 0021_newsletter_send_queue.sql.",
      },
      { status: 503 }
    );
  }

  const auditId = await createAuditEvent({
    action: "newsletter",
    actor: await getAdminEmail(),
    subject: newsletter.subject,
    template: "Load test",
    segment: "test",
    recipientCount: counts.total,
    meta: { newsletter_id: newsletter.id, load_test: true },
  });
  await markNewsletterSending(newsletter.id, { auditId, recipientCount: counts.total });

  // The progress modal drives the batches (one at a time, no race); if it's
  // closed early, /resume hands the rest to the background worker.
  return NextResponse.json({
    ok: true,
    id: newsletter.id,
    queued: counts.total,
  });
}
