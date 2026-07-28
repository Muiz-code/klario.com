import { NextResponse } from "next/server";
import { getAdminEmail } from "@/lib/supabase/server";
import { getResendRecipients } from "@/lib/email/resend-recipients";

export const runtime = "nodejs";
export const maxDuration = 300;

/**
 * Per-recipient delivery record from Resend (times sent / delivered / opened /
 * clicked), grouped. ?days=7|15|30, ?force=1 to bypass the 3-min cache.
 */
export async function GET(req: Request) {
  if (!(await getAdminEmail())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = new URL(req.url);
  const force = url.searchParams.get("force") === "1";
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  const subject = url.searchParams.get("subject") || undefined;

  const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
  if (from && to && DATE_RE.test(from) && DATE_RE.test(to)) {
    // Custom calendar range (from ≤ to). Swap if reversed.
    const [lo, hi] = from <= to ? [from, to] : [to, from];
    return NextResponse.json(await getResendRecipients({ from: lo, to: hi, subject }, force));
  }

  const raw = url.searchParams.get("days");
  // "today"/"0" = since WAT midnight; otherwise one of the fixed windows.
  let days: number;
  if (raw === "today" || raw === "0") {
    days = 0;
  } else {
    const n = Number(raw);
    days = [7, 15, 30, 60].includes(n) ? n : 15;
  }
  return NextResponse.json(await getResendRecipients({ days, subject }, force));
}
