import { NextResponse } from "next/server";
import { scanDuplicates } from "@/lib/db/duplicates";
import { getAdminEmail } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * On-demand scan of the current data for duplicate emails the UNIQUE
 * constraint can't catch (cross-table matches, repeat submitters, stored
 * case/whitespace variants).
 */
export async function GET() {
  const admin = await getAdminEmail();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const report = await scanDuplicates();
  return NextResponse.json(report);
}
