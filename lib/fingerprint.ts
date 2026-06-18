/**
 * Coarse client-side device fingerprint for fraud clustering. Not a precise
 * identifier and not PII: a stable-ish hash of browser/device characteristics
 * so that many "different people" signing up from the same device can be spotted
 * even when they use different emails or switch networks. Best-effort only; a
 * determined user can change it. Returns "" on the server.
 */

type NavExtra = Navigator & {
  deviceMemory?: number;
};

function fnv1a(input: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
}

export function deviceFingerprint(): string {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return "";
  }
  const nav = navigator as NavExtra;
  let timezone = "";
  try {
    timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  } catch {
    timezone = "";
  }
  const parts = [
    nav.userAgent || "",
    nav.language || "",
    (nav.languages || []).join(","),
    String(nav.hardwareConcurrency ?? ""),
    String(nav.deviceMemory ?? ""),
    typeof screen !== "undefined"
      ? `${screen.width}x${screen.height}x${screen.colorDepth}`
      : "",
    String(new Date().getTimezoneOffset()),
    timezone,
  ];
  return fnv1a(parts.join("|"));
}
