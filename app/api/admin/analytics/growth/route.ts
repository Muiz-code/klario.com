import { NextResponse } from "next/server";
import { getGrowthSeries } from "@/lib/db/analytics";
import { getAdminEmail } from "@/lib/supabase/server";

export const runtime = "nodejs";

/** Cumulative subscriber growth for the chart. ?days=30|90|365 or ?days=all. */
export async function GET(req: Request) {
  if (!(await getAdminEmail())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const param = new URL(req.url).searchParams.get("days");
  const days = !param || param === "all" ? null : Math.max(1, Number(param) || 90);
  const series = await getGrowthSeries(days);
  return NextResponse.json(series);
}
