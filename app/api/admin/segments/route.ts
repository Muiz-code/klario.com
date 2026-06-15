import { NextResponse } from "next/server";
import { createSegment } from "@/lib/db/segments";
import { getAdminEmail } from "@/lib/supabase/server";
import { FIELDS, type MatchType, type Rule, type RuleField } from "@/lib/segments/types";

export const runtime = "nodejs";

const VALID_FIELDS = new Set(FIELDS.map((f) => f.field));

function sanitizeRules(input: unknown): Rule[] {
  if (!Array.isArray(input)) return [];
  const rules: Rule[] = [];
  for (const r of input) {
    if (!r || typeof r !== "object") continue;
    const { field, op, value } = r as Record<string, unknown>;
    if (typeof field !== "string" || !VALID_FIELDS.has(field as RuleField)) continue;
    if (typeof op !== "string") continue;
    rules.push({
      field: field as RuleField,
      op: op as Rule["op"],
      value: typeof value === "string" ? value.slice(0, 120) : String(value ?? ""),
    });
  }
  return rules.slice(0, 20);
}

/** Create a custom segment. */
export async function POST(req: Request) {
  if (!(await getAdminEmail())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { name?: unknown; match_type?: unknown; rules?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim().slice(0, 80) : "";
  if (!name) {
    return NextResponse.json({ error: "A name is required." }, { status: 400 });
  }
  const match_type: MatchType = body.match_type === "any" ? "any" : "all";
  const rules = sanitizeRules(body.rules);
  if (rules.length === 0) {
    return NextResponse.json({ error: "Add at least one rule." }, { status: 400 });
  }

  const segment = await createSegment({ name, match_type, rules });
  if (!segment) {
    return NextResponse.json({ error: "Could not save segment." }, { status: 502 });
  }
  return NextResponse.json({ ok: true, segment });
}
