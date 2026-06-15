import { supabaseAdmin } from "@/lib/supabase/admin";
import { emailCounts, normalizeEmail } from "@/lib/duplicates";

/**
 * How many submission rows exist per (normalized) email. Used to flag
 * subscribers who have also filled a public form, and to spot repeat
 * submitters. Capped well above any realistic beta list size.
 */
export async function submissionEmailCounts(): Promise<Map<string, number>> {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("submissions")
    .select("email")
    .not("email", "is", null)
    .limit(20000);
  if (error) {
    console.error("[db] submissionEmailCounts failed:", error.message);
    return new Map();
  }
  return emailCounts((data ?? []).map((r) => r.email as string | null));
}

export type DuplicateReport = {
  counts: {
    signups: number;
    submissions: number;
    crossList: number;
    submissionRepeats: number;
    storedVariants: number;
  };
  /** Emails that are BOTH a subscriber and in the submissions log. */
  crossList: { email: string; submissions: number }[];
  /** Emails that appear in more than one submission row. */
  submissionRepeats: { email: string; count: number }[];
  /** Subscriber emails stored under more than one raw spelling (case/space). */
  storedVariants: { normalized: string; variants: string[] }[];
};

/**
 * Scan the current data for duplicate emails across every angle that the
 * UNIQUE constraint on beta_signups cannot catch: cross-table matches, repeat
 * submitters, and legacy case/whitespace variants stored in the list.
 */
export async function scanDuplicates(): Promise<DuplicateReport> {
  const db = supabaseAdmin();
  const [signupRes, submissionRes] = await Promise.all([
    db.from("beta_signups").select("email").limit(20000),
    db
      .from("submissions")
      .select("email")
      .not("email", "is", null)
      .limit(20000),
  ]);

  const signupEmails = (signupRes.data ?? []).map((r) => r.email as string);
  const submissionCounts = emailCounts(
    (submissionRes.data ?? []).map((r) => r.email as string | null)
  );

  // Stored variants: same normalized email under >1 raw spelling in beta_signups.
  const variantMap = new Map<string, Set<string>>();
  for (const raw of signupEmails) {
    const norm = normalizeEmail(raw);
    if (!norm) continue;
    if (!variantMap.has(norm)) variantMap.set(norm, new Set());
    variantMap.get(norm)!.add(raw);
  }
  const storedVariants = [...variantMap]
    .filter(([, set]) => set.size > 1)
    .map(([normalized, set]) => ({ normalized, variants: [...set] }));

  // Cross-list: subscriber email that also appears in submissions.
  const signupSet = new Set(signupEmails.map(normalizeEmail));
  const crossList = [...submissionCounts]
    .filter(([email]) => signupSet.has(email))
    .map(([email, submissions]) => ({ email, submissions }))
    .sort((a, b) => b.submissions - a.submissions);

  // Submission repeats: same email submitted more than one form.
  const submissionRepeats = [...submissionCounts]
    .filter(([, count]) => count > 1)
    .map(([email, count]) => ({ email, count }))
    .sort((a, b) => b.count - a.count);

  return {
    counts: {
      signups: signupEmails.length,
      submissions: [...submissionCounts.values()].reduce((a, b) => a + b, 0),
      crossList: crossList.length,
      submissionRepeats: submissionRepeats.length,
      storedVariants: storedVariants.length,
    },
    crossList,
    submissionRepeats,
    storedVariants,
  };
}
