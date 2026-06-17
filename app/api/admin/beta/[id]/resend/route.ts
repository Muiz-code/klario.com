import { NextResponse } from "next/server";
import { getAdminEmail } from "@/lib/supabase/server";
import {
  getBetaResponse,
  markConfirmationSent,
} from "@/lib/db/betaResponses";
import { renderBetaConfirmation } from "@/lib/email/betaResponse";
import { sendTransactional } from "@/lib/email/send";
import { RESEND_REPLY_TO } from "@/lib/email/client";

export const runtime = "nodejs";

/** Resend the beta confirmation email for one response. */
export async function POST(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  if (!(await getAdminEmail())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const row = await getBetaResponse(id);
  if (!row || !row.ref) {
    return NextResponse.json({ error: "Response not found." }, { status: 404 });
  }

  const result = await sendTransactional({
    to: row.email,
    email: renderBetaConfirmation({ name: row.name, ref: row.ref, email: row.email }),
    replyTo: RESEND_REPLY_TO,
    tags: [{ name: "type", value: "beta_response" }],
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error || "Send failed." },
      { status: 502 }
    );
  }
  await markConfirmationSent(id, true);
  return NextResponse.json({ ok: true });
}
