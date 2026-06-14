import { createHmac } from "crypto";
import { SITE } from "@/lib/constants";

/**
 * Unsubscribe links are signed so they cannot be forged or used to unsubscribe
 * arbitrary addresses. The token is an HMAC of the lowercased email.
 */
function secret(): string {
  const s = process.env.EMAIL_LINK_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!s) {
    throw new Error(
      "EMAIL_LINK_SECRET (or SUPABASE_SERVICE_ROLE_KEY) must be set to sign email links."
    );
  }
  return s;
}

export function unsubscribeToken(email: string): string {
  return createHmac("sha256", secret())
    .update(email.trim().toLowerCase())
    .digest("hex")
    .slice(0, 32);
}

export function verifyUnsubscribeToken(email: string, token: string): boolean {
  const expected = unsubscribeToken(email);
  if (expected.length !== token.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ token.charCodeAt(i);
  }
  return diff === 0;
}

export function unsubscribeUrl(email: string): string {
  const e = encodeURIComponent(email.trim().toLowerCase());
  const t = unsubscribeToken(email);
  return `${SITE.url}/api/unsubscribe?e=${e}&t=${t}`;
}
