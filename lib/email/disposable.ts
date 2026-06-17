/**
 * A compact blocklist of well-known disposable / throwaway email domains.
 * Not exhaustive (no list is) but it stops the obvious referral-fraud emails at
 * the door. Verification (verify-before-count) handles the long tail.
 */
const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com",
  "guerrillamail.com",
  "guerrillamail.info",
  "sharklasers.com",
  "grr.la",
  "10minutemail.com",
  "10minutemail.net",
  "temp-mail.org",
  "tempmail.com",
  "tempmailo.com",
  "throwawaymail.com",
  "yopmail.com",
  "getnada.com",
  "nada.email",
  "dispostable.com",
  "trashmail.com",
  "mailnesia.com",
  "maildrop.cc",
  "fakeinbox.com",
  "mintemail.com",
  "mohmal.com",
  "emailondeck.com",
  "spamgourmet.com",
  "tempinbox.com",
  "mytemp.email",
  "moakt.com",
  "luxusmail.org",
  "discard.email",
  "tempr.email",
  "burnermail.io",
]);

export function isDisposableEmail(email: string): boolean {
  const domain = email.split("@")[1]?.trim().toLowerCase();
  return domain ? DISPOSABLE_DOMAINS.has(domain) : false;
}
