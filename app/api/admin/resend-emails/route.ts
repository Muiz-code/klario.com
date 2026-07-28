import { NextResponse } from "next/server";
import { getAdminEmail } from "@/lib/supabase/server";
import { getResendEmails } from "@/lib/email/resend-emails";

export const runtime = "nodejs";
export const maxDuration = 300;

/** Every individual email from Resend. ?days= | ?from=&to= | ?force=1 */
export async function GET(req: Request) {
  if (!(await getAdminEmail())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = new URL(req.url);
  const force = url.searchParams.get("force") === "1";
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
  if (from && to && DATE_RE.test(from) && DATE_RE.test(to)) {
    const [lo, hi] = from <= to ? [from, to] : [to, from];
    return NextResponse.json(await getResendEmails({ from: lo, to: hi }, force));
  }

  const raw = url.searchParams.get("days");
  let days: number;
  if (raw === "today" || raw === "0") days = 0;
  else {
    const n = Number(raw);
    days = [7, 15, 30, 60].includes(n) ? n : 15;
  }
  return NextResponse.json(await getResendEmails({ days }, force));
}
