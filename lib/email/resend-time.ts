/**
 * Parse a Resend timestamp to epoch ms. Resend returns Postgres-style strings
 * like "2026-07-28 15:30:58.753116+00" — a space instead of 'T', microsecond
 * precision, and a 2-digit "+00" offset. `Date.parse` returns NaN for that
 * offset form, so we parse the parts explicitly (treating it as the UTC instant
 * it is). Falls back to Date.parse for already-ISO strings.
 */
export function resendTimeToMs(ts: string): number {
  const m = String(ts).match(
    /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?\s*(Z|[+-]\d{2}:?\d{0,2})?$/
  );
  if (!m) return Date.parse(ts);
  const [, Y, Mo, D, h, mi, s, frac, off] = m;
  let ms = Date.UTC(
    +Y,
    +Mo - 1,
    +D,
    +h,
    +mi,
    +s,
    frac ? Math.round(Number("0." + frac) * 1000) : 0
  );
  if (off && off !== "Z") {
    const sign = off[0] === "-" ? -1 : 1;
    const digits = off.slice(1).replace(":", "");
    const oh = Number(digits.slice(0, 2)) || 0;
    const om = Number(digits.slice(2, 4)) || 0;
    ms -= sign * (oh * 60 + om) * 60_000;
  }
  return ms;
}
