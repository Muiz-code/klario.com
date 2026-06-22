import { NextResponse } from "next/server";
import { getAdminEmail } from "@/lib/supabase/server";
import { mergeDuplicateSignups } from "@/lib/db/signups";

export const runtime = "nodejs";

/** Merge subscriber rows that share the same normalized email. */
export async function POST() {
  if (!(await getAdminEmail())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await mergeDuplicateSignups();
  return NextResponse.json({ ok: true, ...result });
}
