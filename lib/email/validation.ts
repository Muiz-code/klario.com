const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const v = value.trim();
  if (!EMAIL_RE.test(v)) return null;
  if (v.length > 254) return null;
  return v.toLowerCase();
}

export function clean(value: unknown, maxLen = 500): string | undefined {
  if (typeof value !== "string") return undefined;
  const v = value.trim();
  if (!v) return undefined;
  return v.slice(0, maxLen);
}

export function splitName(full?: string): {
  firstName?: string;
  lastName?: string;
} {
  if (!full) return {};
  const parts = full.trim().split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0] };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}
