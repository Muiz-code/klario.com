import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;

if (!apiKey && process.env.NODE_ENV === "production") {
  console.warn("[email] RESEND_API_KEY missing, emails will fail.");
}

export const resend = new Resend(apiKey || "re_missing_key");

// A human sender name ("Dan from KLARIO") reads as 1:1 mail and lands in Gmail's
// Primary tab far more often than a brand-only name. Applies to every send —
// Anchor Club, beta, automations, contact/forms, and segment newsletters.
// Hardcoded (not env-driven) so it can never drift back to a brand-only name
// via a stale environment variable; change it here and redeploy.
export const RESEND_FROM = "Dan from KLARIO <hello@klario.finance>";
export const RESEND_REPLY_TO =
  process.env.RESEND_REPLY_TO || "hello@klario.finance";
export const ADMIN_NOTIFY_EMAIL =
  process.env.ADMIN_NOTIFY_EMAIL || "hello@klario.finance";
