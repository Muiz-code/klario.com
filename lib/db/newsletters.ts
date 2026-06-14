import { supabaseAdmin } from "@/lib/supabase/admin";

export type Newsletter = {
  id: string;
  subject: string;
  html: string;
  status: "draft" | "sending" | "sent" | "failed";
  recipient_count: number;
  sent_count: number;
  sent_at: string | null;
  created_at: string;
};

export async function listNewsletters(): Promise<Newsletter[]> {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("newsletters")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) {
    console.error("[db] listNewsletters failed:", error.message);
    return [];
  }
  return (data ?? []) as Newsletter[];
}

export async function getNewsletter(id: string): Promise<Newsletter | null> {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("newsletters")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.error("[db] getNewsletter failed:", error.message);
    return null;
  }
  return (data as Newsletter) ?? null;
}

export async function createNewsletter(opts: {
  subject: string;
  html: string;
}): Promise<Newsletter | null> {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("newsletters")
    .insert({ subject: opts.subject, html: opts.html })
    .select("*")
    .single();
  if (error) {
    console.error("[db] createNewsletter failed:", error.message);
    return null;
  }
  return data as Newsletter;
}

export async function markNewsletterSent(
  id: string,
  opts: { recipientCount: number; sentCount: number; status: "sent" | "failed" }
): Promise<void> {
  const db = supabaseAdmin();
  const { error } = await db
    .from("newsletters")
    .update({
      status: opts.status,
      recipient_count: opts.recipientCount,
      sent_count: opts.sentCount,
      sent_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) console.error("[db] markNewsletterSent failed:", error.message);
}

export async function deleteNewsletter(id: string): Promise<boolean> {
  const db = supabaseAdmin();
  const { error } = await db.from("newsletters").delete().eq("id", id);
  if (error) {
    console.error("[db] deleteNewsletter failed:", error.message);
    return false;
  }
  return true;
}
