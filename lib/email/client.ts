import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;

if (!apiKey && process.env.NODE_ENV === "production") {
  console.warn("[email] RESEND_API_KEY missing, emails will fail.");
}

export const resend = new Resend(apiKey || "re_missing_key");

export const RESEND_FROM = process.env.RESEND_FROM || "Klario <hello@klario.finance>";
export const RESEND_REPLY_TO =
  process.env.RESEND_REPLY_TO || "hello@klario.finance";
export const ADMIN_NOTIFY_EMAIL =
  process.env.ADMIN_NOTIFY_EMAIL || "hello@klario.finance";
