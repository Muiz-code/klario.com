import { NextResponse } from "next/server";
import { updateAutomation } from "@/lib/db/automations";
import { getAdminEmail } from "@/lib/supabase/server";

export const runtime = "nodejs";

/** Update one automation's enabled / delay / subject / body. */
export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  if (!(await getAdminEmail())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;

  let body: {
    enabled?: unknown;
    delay_hours?: unknown;
    subject?: unknown;
    body?: unknown;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const patch: {
    enabled?: boolean;
    delay_hours?: number;
    subject?: string;
    body?: string;
  } = {};
  if (typeof body.enabled === "boolean") patch.enabled = body.enabled;
  if (typeof body.delay_hours === "number" && Number.isFinite(body.delay_hours)) {
    patch.delay_hours = Math.max(0, Math.round(body.delay_hours));
  }
  if (typeof body.subject === "string") patch.subject = body.subject.slice(0, 200);
  if (typeof body.body === "string") patch.body = body.body.slice(0, 5000);

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  const updated = await updateAutomation(id, patch);
  if (!updated) {
    return NextResponse.json({ error: "Update failed." }, { status: 502 });
  }
  return NextResponse.json({ ok: true, automation: updated });
}
