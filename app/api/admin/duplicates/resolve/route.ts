import { NextResponse } from "next/server";
import { getAdminEmail } from "@/lib/supabase/server";
import { deleteSignup } from "@/lib/db/signups";
import { deleteSubmission } from "@/lib/db/submissions";

export const runtime = "nodejs";

type RemoveItem = { type: "subscriber" | "submission"; id: string };

/** Resolve a duplicate: delete the records the admin didn't choose to keep. */
export async function POST(req: Request) {
  if (!(await getAdminEmail())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { remove?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const remove: RemoveItem[] = Array.isArray(body.remove)
    ? body.remove.filter(
        (r): r is RemoveItem =>
          !!r &&
          typeof (r as RemoveItem).id === "string" &&
          ((r as RemoveItem).type === "subscriber" ||
            (r as RemoveItem).type === "submission")
      )
    : [];

  let removed = 0;
  for (const item of remove) {
    const ok =
      item.type === "subscriber"
        ? await deleteSignup(item.id)
        : await deleteSubmission(item.id);
    if (ok) removed++;
  }

  return NextResponse.json({ ok: true, removed });
}
