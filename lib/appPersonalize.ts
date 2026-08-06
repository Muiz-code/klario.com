/**
 * Placeholder substitution for in-app messages. No DB imports, so the composer
 * preview and the actual send run the SAME function — a preview that can't
 * drift from what lands on the phone.
 *
 * Mirrors Kairo-Admin's `personalize`, so a message written in either admin
 * reads the same way.
 */

/**
 * "ada.okoro92@gmail.com" → "Ada Okoro". Empty when the local part is all
 * digits or noise, so the caller falls through to the generic greeting.
 */
export function friendlyNameFromEmail(email: string): string {
  const local = (email || "").split("@")[0] ?? "";
  const cleaned = local
    .replace(/[._-]+/g, " ")
    .replace(/\d+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) return "";
  return cleaned
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/**
 * The name to greet someone by. Falls back down the chain rather than ever
 * rendering an empty or broken greeting:
 *   the name we hold → the name derived from their email → "there".
 * Only the first word: "{name}" is used as a vocative ("It's been a while,
 * {name}"), where a full legal name reads oddly.
 */
export function greetingName(recipient: { name?: string | null; email?: string | null }): string {
  const known = recipient.name?.trim();
  const derived = known || friendlyNameFromEmail(recipient.email ?? "");
  const first = (derived || "there").split(" ")[0];
  return first || "there";
}

/** Fill {name} and {email} in a message. Tolerates spacing and casing. */
export function personalize(
  template: string,
  recipient: { name?: string | null; email?: string | null }
): string {
  return template
    .replace(/\{\s*name\s*\}/gi, greetingName(recipient))
    .replace(/\{\s*email\s*\}/gi, recipient.email || "—");
}
