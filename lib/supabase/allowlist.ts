/**
 * Admin allowlist. Kept free of next/headers and other server-only imports so
 * it can be used from proxy.ts (which runs in the proxy/middleware runtime).
 */
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}
