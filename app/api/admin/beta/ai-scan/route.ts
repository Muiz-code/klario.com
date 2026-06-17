import { NextResponse } from "next/server";
import { getAdminEmail } from "@/lib/supabase/server";
import {
  listBetaResponses,
  saveAiAssessment,
  type BetaResponse,
} from "@/lib/db/betaResponses";
import { assessFraud, isAiConfigured, type FraudInput } from "@/lib/ai/fraud";

export const runtime = "nodejs";
export const maxDuration = 60;

// Cap a "scan all" pass so one click can't fan out into hundreds of API calls.
const SCAN_ALL_LIMIT = 40;

function buildSignals(r: BetaResponse, all: BetaResponse[]) {
  const ipCount = r.ip ? all.filter((x) => x.ip === r.ip).length : 0;
  const referralCount = all.filter(
    (x) => x.referred_by_id === r.id && x.verified
  ).length;
  let mutual = false;
  if (r.referred_by_id) {
    const ref = all.find((x) => x.id === r.referred_by_id);
    if (ref && ref.referred_by_id === r.id) mutual = true;
  }
  return {
    sharedIpCount: ipCount,
    mutualReferral: mutual,
    verified: r.verified,
    referralCount,
    wasReferred: !!r.referred_by_id,
  };
}

function toInput(r: BetaResponse, all: BetaResponse[]): FraudInput {
  return {
    name: r.name,
    email: r.email,
    phone: r.phone,
    method: r.method,
    pain: r.pain,
    sheetlife: r.sheetlife,
    trust: r.trust,
    features: r.features,
    price: r.price,
    dream: r.dream,
    signals: buildSignals(r, all),
  };
}

/**
 * Admin-triggered AI fraud scan. Body: { id } scores one response; { all: true }
 * scores up to SCAN_ALL_LIMIT not-yet-checked responses. Results are persisted.
 */
export async function POST(req: Request) {
  if (!(await getAdminEmail())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isAiConfigured()) {
    return NextResponse.json(
      { error: "AI is not configured. Set ANTHROPIC_API_KEY." },
      { status: 503 }
    );
  }

  let body: { id?: string; all?: boolean };
  try {
    body = (await req.json()) as { id?: string; all?: boolean };
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const all = await listBetaResponses();

  let targets: BetaResponse[];
  if (body.all) {
    targets = all.filter((r) => !r.ai_checked_at).slice(0, SCAN_ALL_LIMIT);
  } else if (body.id) {
    const one = all.find((r) => r.id === body.id);
    if (!one) {
      return NextResponse.json({ error: "Response not found." }, { status: 404 });
    }
    targets = [one];
  } else {
    return NextResponse.json(
      { error: "Provide an id or all:true." },
      { status: 400 }
    );
  }

  if (targets.length === 0) {
    return NextResponse.json({ ok: true, scanned: 0, failed: 0, results: [] });
  }

  const results: {
    id: string;
    ok: boolean;
    risk?: number;
    level?: string;
    error?: string;
  }[] = [];
  let scanned = 0;
  let failed = 0;

  for (const r of targets) {
    const res = await assessFraud(toInput(r, all));
    if (res.ok) {
      await saveAiAssessment(r.id, res.assessment);
      scanned++;
      results.push({
        id: r.id,
        ok: true,
        risk: res.assessment.risk,
        level: res.assessment.level,
      });
    } else {
      failed++;
      results.push({ id: r.id, ok: false, error: res.error });
    }
  }

  return NextResponse.json({ ok: true, scanned, failed, results });
}
