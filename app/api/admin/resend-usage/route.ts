import { NextResponse, after } from "next/server";
import { getAdminEmail } from "@/lib/supabase/server";
import { getResendUsage } from "@/lib/email/resend-usage";
import { reconcileFromResend } from "@/lib/email/resend-reconcile";

export const runtime = "nodejs";
export const maxDuration = 300;

// Auto-sync the audit log from Resend at most this often (per instance), so the
// meter's background refresh keeps delivered/opened current without a webhook.
const RECONCILE_EVERY_MS = 15 * 60_000;
let lastReconcileAt = 0;

/** Live Resend send usage (daily + monthly), cached 60s server-side. */
export async function GET(req: Request) {
  if (!(await getAdminEmail())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const force = new URL(req.url).searchParams.get("force") === "1";
  const usage = await getResendUsage(force);

  // Piggy-back a throttled reconcile so the audit log self-heals in the
  // background whenever the dashboard is open (no webhook needed).
  const now = Date.now();
  if (now - lastReconcileAt > RECONCILE_EVERY_MS) {
    lastReconcileAt = now;
    after(async () => {
      try {
        await reconcileFromResend(15);
      } catch {
        /* best-effort; the manual "Sync from Resend" button is the backstop */
      }
    });
  }

  return NextResponse.json(usage);
}
