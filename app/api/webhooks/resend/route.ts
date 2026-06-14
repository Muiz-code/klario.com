import { NextResponse } from "next/server";
import { verifyResendWebhook } from "@/lib/email/resend-webhook";
import { applyResendEvent, type ResendEventType } from "@/lib/db/audit";

export const runtime = "nodejs";

/**
 * Resend webhook. Configure it at https://resend.com/webhooks pointing to
 * /api/webhooks/resend, then put the signing secret in RESEND_WEBHOOK_SECRET.
 * Updates email_log delivery/engagement and rolls the totals up onto the audit
 * row. (Opens need open tracking enabled and clicks need click tracking enabled
 * in the Resend domain settings.)
 *
 * This route is intentionally public (Resend calls it). Authenticity is
 * enforced by the Svix signature, not a session.
 */
const TYPE_MAP: Record<string, ResendEventType> = {
  "email.delivered": "delivered",
  "email.bounced": "bounced",
  "email.complained": "complained",
  "email.opened": "opened",
  "email.clicked": "clicked",
};

export async function POST(req: Request) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "Webhook not configured (RESEND_WEBHOOK_SECRET missing)." },
      { status: 503 }
    );
  }

  const body = await req.text();
  const ok = await verifyResendWebhook({
    secret,
    id: req.headers.get("svix-id"),
    timestamp: req.headers.get("svix-timestamp"),
    signature: req.headers.get("svix-signature"),
    body,
  });
  if (!ok) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  let event: { type?: string; created_at?: string; data?: { email_id?: string } };
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const type = event.type ? TYPE_MAP[event.type] : undefined;
  const resendId = event.data?.email_id;

  // Acknowledge everything (200) so Resend stops retrying; only act on the
  // event types we track.
  if (type && resendId) {
    await applyResendEvent({
      resendId,
      type,
      at: event.created_at ?? new Date().toISOString(),
    });
  }

  return NextResponse.json({ ok: true });
}
