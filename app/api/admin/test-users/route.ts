import { NextResponse } from "next/server";
import { getAdminEmail } from "@/lib/supabase/server";
import {
  createTestUsers,
  countTestUsers,
  deleteTestUsers,
} from "@/lib/db/testUsers";

export const runtime = "nodejs";
export const maxDuration = 120;

/** How many test users currently exist. */
export async function GET() {
  if (!(await getAdminEmail())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ count: await countTestUsers() });
}

/** Create N test users (safe resend.dev addresses). body: { count } */
export async function POST(req: Request) {
  if (!(await getAdminEmail())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let count = 1000;
  try {
    const body = (await req.json()) as { count?: unknown };
    if (typeof body.count === "number" && Number.isFinite(body.count)) {
      count = body.count;
    }
  } catch {
    /* default 1000 */
  }
  const created = await createTestUsers(count);
  return NextResponse.json({ ok: true, created, total: await countTestUsers() });
}

/** Delete all test users and their queue/log rows. */
export async function DELETE() {
  if (!(await getAdminEmail())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await deleteTestUsers();
  return NextResponse.json({ ok: true, ...result });
}
