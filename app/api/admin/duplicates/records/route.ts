import { NextResponse } from "next/server";
import { getAdminEmail } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { normalizeEmail } from "@/lib/duplicates";

export const runtime = "nodejs";

export type DuplicateRecord = {
  type: "subscriber" | "submission";
  id: string;
  email: string;
  title: string;
  detail: string;
  date: string;
};

/** Every record (subscriber rows + submission rows) tied to one email. */
export async function GET(req: Request) {
  if (!(await getAdminEmail())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const email = new URL(req.url).searchParams.get("email") || "";
  const norm = normalizeEmail(email);
  if (!norm) return NextResponse.json({ records: [] });

  const db = supabaseAdmin();
  const [sg, sub] = await Promise.all([
    db
      .from("beta_signups")
      .select("id, email, first_name, last_name, status, source, created_at")
      .limit(20000),
    db
      .from("submissions")
      .select("id, email, kind, name, topic, message, why, created_at")
      .not("email", "is", null)
      .limit(20000),
  ]);

  const records: DuplicateRecord[] = [];

  for (const r of sg.data ?? []) {
    if (normalizeEmail(r.email as string) !== norm) continue;
    const name = [r.first_name, r.last_name].filter(Boolean).join(" ");
    records.push({
      type: "subscriber",
      id: r.id as string,
      email: r.email as string,
      title: name || (r.email as string),
      detail: `Subscriber · ${r.status}${r.source ? ` · via ${r.source}` : ""}`,
      date: r.created_at as string,
    });
  }

  for (const r of sub.data ?? []) {
    if (normalizeEmail(r.email as string) !== norm) continue;
    const snippet =
      (r.message as string) || (r.why as string) || (r.topic as string) || "";
    records.push({
      type: "submission",
      id: r.id as string,
      email: r.email as string,
      title: (r.name as string) || (r.email as string),
      detail: `${r.kind} submission${snippet ? ` · ${snippet.slice(0, 60)}` : ""}`,
      date: r.created_at as string,
    });
  }

  records.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  return NextResponse.json({ records });
}
