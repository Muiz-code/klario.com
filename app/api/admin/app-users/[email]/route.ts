import { NextResponse } from "next/server";
import { requireApiCapability } from "@/lib/auth/access";
import { normalizeEmail } from "@/lib/duplicates";
import {
  getAppProfilesByEmails,
  getAppActivityByUserIds,
  getLinkedBanksByUserIds,
} from "@/lib/db/appProfiles";
import { getAppTasksByUserIds } from "@/lib/db/appTasks";
import { getAppFinanceByUserIds } from "@/lib/db/appFinance";

export const runtime = "nodejs";

/**
 * Everything about one app user, by email — the Klario task checklist, money,
 * activity counts and linked banks. Fetched when a row is opened rather than
 * for the whole list, since each of these reads several app-DB tables.
 */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ email: string }> }
) {
  if (!(await requireApiCapability("app_users"))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { email: raw } = await ctx.params;
  const email = normalizeEmail(decodeURIComponent(raw));
  if (!email) {
    return NextResponse.json({ error: "Invalid email." }, { status: 400 });
  }

  const profiles = await getAppProfilesByEmails([email]);
  const app = profiles.get(email) ?? null;
  if (!app) {
    // Not an error: plenty of contacts have never signed up in the app.
    return NextResponse.json({ app: null });
  }

  const [tasks, finance, activity, banks] = await Promise.all([
    getAppTasksByUserIds([app.id]),
    getAppFinanceByUserIds([app.id]),
    getAppActivityByUserIds([app.id]),
    getLinkedBanksByUserIds([app.id]),
  ]);

  return NextResponse.json({
    app,
    tasks: tasks.get(app.id) ?? null,
    finance: finance.get(app.id) ?? null,
    activity: activity.get(app.id) ?? null,
    banks: banks.get(app.id) ?? [],
  });
}
