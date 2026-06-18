/**
 * AI fraud assessment for beta questionnaire responses, powered by Claude.
 *
 * Admin-triggered: an admin clicks "Analyze" on a row (or "Scan all"), and we
 * ask Claude Haiku to score how likely that signup is fake / a referral-farming
 * sock-puppet, given the answers plus the deterministic fraud signals we already
 * compute (shared IP, mutual referral, verification status, etc.).
 *
 * Returns a 0-100 risk score, a low/medium/high band, and short reasons. Cheap
 * and fast: Haiku 4.5 with a constrained JSON schema, one short non-streaming
 * call per response.
 */
import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-haiku-4-5";

export type FraudSignals = {
  /** How many responses share this submitter's IP. */
  sharedIpCount: number;
  /** How many responses share this submitter's device fingerprint. */
  sameDeviceCount: number;
  /** Email collapses to the same inbox as another signup (gmail dot/plus tricks). */
  aliasReuse: boolean;
  /** A↔B both claim each other as referrer. */
  mutualReferral: boolean;
  /** Did they confirm their email? */
  verified: boolean;
  /** How many verified people they referred. */
  referralCount: number;
  /** Did they arrive via someone's referral code? */
  wasReferred: boolean;
};

/** The slice of a response the classifier reads (no PII beyond what it needs). */
export type FraudInput = {
  name: string | null;
  email: string;
  phone: string | null;
  method: string | null;
  pain: string[];
  sheetlife: string | null;
  trust: number | null;
  features: string[];
  price: string | null;
  dream: string | null;
  signals: FraudSignals;
};

export type FraudLevel = "low" | "medium" | "high";

export type FraudAssessment = {
  risk: number; // 0-100
  level: FraudLevel;
  reasons: string[];
};

export type FraudResult =
  | { ok: true; assessment: FraudAssessment }
  | { ok: false; error: string };

export function isAiConfigured(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}

const SYSTEM = `You are a fraud-detection analyst for a Nigerian fintech's private beta waitlist.
The waitlist has a referral program, which creates an incentive to farm fake signups (sock-puppets, bots, disposable identities) to climb the queue or inflate referral counts.

You will be given ONE waitlist response: the person's free-text questionnaire answers plus deterministic fraud signals already computed by the system. Judge how likely THIS signup is fraudulent or fake.

Weigh:
- Answer quality: gibberish, contradictory, empty-but-required, copy-paste/templated, or nonsensical answers raise risk. Thoughtful, specific, locally-plausible answers lower it.
- Signals: many signups sharing one IP or one device fingerprint, an email that reuses another signup's inbox via aliasing tricks, mutual (reciprocal) referrals, and being unverified all raise risk. A verified email lowers it. Several signups on the same device is a strong sock-puppet signal.
- Coherence: do the answers hang together as a real person with a real money problem?

Do NOT penalize: non-native English, short-but-genuine answers, a missing phone number, or simply being referred by someone. Being referred is normal; referral FARMING patterns are the concern.

Return only the structured fields. risk is 0-100 (0 = clearly genuine, 100 = clearly fraudulent). level: low (0-39), medium (40-69), high (70-100). reasons: 1-4 short, concrete bullet phrases citing the specific evidence.`;

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    risk: {
      type: "integer",
      description: "Fraud risk score from 0 (genuine) to 100 (fraudulent).",
    },
    level: {
      type: "string",
      enum: ["low", "medium", "high"],
      description: "Risk band derived from the score.",
    },
    reasons: {
      type: "array",
      items: { type: "string" },
      description: "1-4 short concrete reasons for the score.",
    },
  },
  required: ["risk", "level", "reasons"],
} as const;

function buildUserContent(input: FraudInput): string {
  const s = input.signals;
  const lines = [
    "RESPONSE",
    `name: ${input.name ?? "(none)"}`,
    `email: ${input.email}`,
    `phone: ${input.phone ?? "(none)"}`,
    `how they track money: ${input.method ?? "(blank)"}`,
    `biggest pains: ${input.pain.length ? input.pain.join("; ") : "(blank)"}`,
    `spreadsheet lifespan: ${input.sheetlife ?? "(blank)"}`,
    `bank-link comfort (1-5): ${input.trust ?? "(blank)"}`,
    `wanted features: ${input.features.length ? input.features.join("; ") : "(blank)"}`,
    `fair price/month: ${input.price ?? "(blank)"}`,
    `what would make money less stressful: ${input.dream ?? "(blank)"}`,
    "",
    "SIGNALS",
    `signups sharing this IP: ${s.sharedIpCount}`,
    `signups sharing this device: ${s.sameDeviceCount}`,
    `email reuses another signup's inbox (alias trick): ${s.aliasReuse ? "yes" : "no"}`,
    `mutual/reciprocal referral: ${s.mutualReferral ? "yes" : "no"}`,
    `email verified: ${s.verified ? "yes" : "no"}`,
    `was referred by a code: ${s.wasReferred ? "yes" : "no"}`,
    `verified people they referred: ${s.referralCount}`,
  ];
  return lines.join("\n");
}

function clampLevel(risk: number): FraudLevel {
  if (risk >= 70) return "high";
  if (risk >= 40) return "medium";
  return "low";
}

/** Score one response with Claude. Never throws — returns {ok:false} on failure. */
export async function assessFraud(input: FraudInput): Promise<FraudResult> {
  if (!isAiConfigured()) {
    return { ok: false, error: "AI is not configured (missing ANTHROPIC_API_KEY)." };
  }

  const client = new Anthropic();

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 512,
      system: SYSTEM,
      output_config: { format: { type: "json_schema", schema: SCHEMA } },
      messages: [{ role: "user", content: buildUserContent(input) }],
    });

    if (response.stop_reason === "refusal") {
      return { ok: false, error: "The model declined to assess this response." };
    }

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim();

    if (!text) return { ok: false, error: "Empty response from the model." };

    let parsed: { risk?: unknown; level?: unknown; reasons?: unknown };
    try {
      parsed = JSON.parse(text);
    } catch {
      return { ok: false, error: "Could not parse the model's response." };
    }

    const rawRisk = Number(parsed.risk);
    const risk = Number.isFinite(rawRisk)
      ? Math.max(0, Math.min(100, Math.round(rawRisk)))
      : 0;
    const level: FraudLevel =
      parsed.level === "low" || parsed.level === "medium" || parsed.level === "high"
        ? parsed.level
        : clampLevel(risk);
    const reasons = Array.isArray(parsed.reasons)
      ? parsed.reasons
          .filter((x): x is string => typeof x === "string")
          .map((s) => s.trim())
          .filter(Boolean)
          .slice(0, 4)
      : [];

    return { ok: true, assessment: { risk, level, reasons } };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[ai/fraud] assessFraud failed:", msg);
    return { ok: false, error: msg };
  }
}
