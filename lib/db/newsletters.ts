import { supabaseAdmin } from "@/lib/supabase/admin";

/** A file attached to a newsletter (e.g. a PDF), stored by public URL. */
export type NewsletterAttachment = { filename: string; url: string };

export type Newsletter = {
  id: string;
  subject: string;
  html: string;
  status: "draft" | "sending" | "sent" | "failed";
  recipient_count: number;
  sent_count: number;
  sent_at: string | null;
  created_at: string;
  attachments: NewsletterAttachment[];
  send_audit_id: string | null;
};

function cleanAttachments(value: unknown): NewsletterAttachment[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((a): a is Record<string, unknown> => !!a && typeof a === "object")
    .map((a) => ({
      filename: typeof a.filename === "string" ? a.filename.slice(0, 200) : "attachment.pdf",
      url: typeof a.url === "string" ? a.url : "",
    }))
    .filter((a) => /^https?:\/\//i.test(a.url))
    .slice(0, 5);
}

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
  attachments?: NewsletterAttachment[];
}): Promise<Newsletter | null> {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("newsletters")
    .insert({
      subject: opts.subject,
      html: opts.html,
      attachments: cleanAttachments(opts.attachments),
    })
    .select("*")
    .single();
  if (error) {
    console.error("[db] createNewsletter failed:", error.message);
    return null;
  }
  return data as Newsletter;
}

/** Mark a newsletter as queued/in-progress for a background (chunked) send. */
export async function markNewsletterSending(
  id: string,
  opts: { auditId: string | null; recipientCount: number }
): Promise<void> {
  const db = supabaseAdmin();
  const { error } = await db
    .from("newsletters")
    .update({
      status: "sending",
      send_audit_id: opts.auditId,
      recipient_count: opts.recipientCount,
    })
    .eq("id", id);
  if (error) console.error("[db] markNewsletterSending failed:", error.message);
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
