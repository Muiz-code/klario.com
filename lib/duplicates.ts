/**
 * Shared, dependency-free helpers for spotting duplicate email addresses,
 * wherever they come from (public forms or CSV upload). The DB enforces a
 * UNIQUE email on beta_signups, so true row duplicates can't be stored there;
 * the duplicates that matter in practice are:
 *   - the same email repeated inside one CSV upload,
 *   - an email that is both a subscriber AND in the submissions log,
 *   - an email that appears multiple times in the append-only submissions log,
 *   - stored variants that only differ by case / surrounding whitespace.
 */

/** Canonical form used for all duplicate comparisons. */
export function normalizeEmail(email: string | null | undefined): string {
  return (email ?? "").trim().toLowerCase();
}

/**
 * Count how many times each (normalized) email occurs. Blank emails are
 * ignored. Returns a Map keyed by the normalized email.
 */
export function emailCounts(
  emails: Array<string | null | undefined>
): Map<string, number> {
  const counts = new Map<string, number>();
  for (const raw of emails) {
    const email = normalizeEmail(raw);
    if (!email) continue;
    counts.set(email, (counts.get(email) ?? 0) + 1);
  }
  return counts;
}

/** Normalized emails that occur more than once in the given list. */
export function findDuplicateEmails(
  emails: Array<string | null | undefined>
): string[] {
  return [...emailCounts(emails)]
    .filter(([, count]) => count > 1)
    .map(([email]) => email);
}

/**
 * Set of normalized emails that occur more than once. Convenient for O(1)
 * "is this row a duplicate?" checks while rendering a table.
 */
export function duplicateEmailSet(
  emails: Array<string | null | undefined>
): Set<string> {
  return new Set(findDuplicateEmails(emails));
}
