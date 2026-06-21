import { supabaseAdmin } from "@/lib/supabase/admin";

export type SubmissionKind = "beta" | "ambassador" | "contact" | "newsletter";

export type Submission = {
  id: string;
  kind: SubmissionKind;
  email: string | null;
  name: string | null;
  phone: string | null;
  banks: string | null;
  device: string | null;
  role: string | null;
  institution: string | null;
  level: string | null;
  why: string | null;
  topic: string | null;
  message: string | null;
  created_at: string;
};

export type SubmissionInput = Omit<Submission, "id" | "created_at">;

export async function saveSubmission(
  input: Partial<SubmissionInput> & { kind: SubmissionKind }
): Promise<void> {
  const db = supabaseAdmin();
  const { error } = await db.from("submissions").insert({
    kind: input.kind,
    email: input.email ?? null,
    name: input.name ?? null,
    phone: input.phone ?? null,
    banks: input.banks ?? null,
    device: input.device ?? null,
    role: input.role ?? null,
    institution: input.institution ?? null,
    level: input.level ?? null,
    why: input.why ?? null,
    topic: input.topic ?? null,
    message: input.message ?? null,
  });
  if (error) console.error("[db] saveSubmission failed:", error.message);
}

export async function listSubmissions(opts?: {
  kind?: SubmissionKind;
  limit?: number;
}): Promise<Submission[]> {
  const db = supabaseAdmin();
  let q = db
    .from("submissions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(opts?.limit ?? 500);
  if (opts?.kind) q = q.eq("kind", opts.kind);
  const { data, error } = await q;
  if (error) {
    console.error("[db] listSubmissions failed:", error.message);
    return [];
  }
  return (data ?? []) as Submission[];
}

export async function deleteSubmission(id: string): Promise<boolean> {
  const db = supabaseAdmin();
  const { error } = await db.from("submissions").delete().eq("id", id);
  if (error) {
    console.error("[db] deleteSubmission failed:", error.message);
    return false;
  }
  return true;
}
