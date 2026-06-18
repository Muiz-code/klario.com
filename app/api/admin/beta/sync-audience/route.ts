import { NextResponse } from "next/server";
import { getAdminEmail } from "@/lib/supabase/server";
import { listBetaResponses } from "@/lib/db/betaResponses";
import { importSignups, type SignupInput } from "@/lib/db/signups";
import { splitName } from "@/lib/email/validation";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * Reconcile the audience: ensure every beta respondent is on the subscriber
 * list. importSignups skips emails that already exist, so this only inserts the
 * ones that slipped through (e.g. an earlier failed upsert).
 */
export async function POST() {
  if (!(await getAdminEmail())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const responses = await listBetaResponses();
  const rows: SignupInput[] = responses.map((r) => {
    const { firstName, lastName } = splitName(r.name ?? undefined);
    return {
      email: r.email,
      first_name: firstName ?? null,
      last_name: lastName ?? null,
      phone: r.phone ?? null,
    };
  });

  const result = await importSignups(rows, "beta");
  return NextResponse.json({ ok: true, added: result.added });
}
