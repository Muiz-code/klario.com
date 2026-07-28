import { NextResponse } from "next/server";
import { getAdminEmail } from "@/lib/supabase/server";
import { triggerSendWorker } from "@/lib/email/newsletterSender";

export const runtime = "nodejs";

/**
 * Hand an in-progress send off to the background worker — used when the admin
 * closes the progress modal before the queue is drained, so the rest still send.
 */
export async function POST(req: Request) {
  if (!(await getAdminEmail())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  triggerSendWorker();
  return NextResponse.json({ ok: true });
}
