import { supabaseAdmin } from "@/lib/supabase/admin";

// The background send queue: one row per (newsletter, recipient). A cron worker
// drains pending rows in chunks so sends resume after interruption and scale.

export type QueueRecipient = {
  email: string;
  first_name: string | null;
  signup_id: string | null;
};

export type QueueRow = {
  id: string;
  email: string;
  first_name: string | null;
  signup_id: string | null;
};

export type QueueCounts = { pending: number; sent: number; failed: number; total: number };

/**
 * Enqueue recipients for a newsletter (idempotent per email). Inserts in chunks
 * and ignores duplicates, so re-queuing only adds people not already queued.
 * Returns how many rows now exist as pending for this newsletter.
 */
export async function enqueueRecipients(
  newsletterId: string,
  recipients: QueueRecipient[]
): Promise<number> {
  const db = supabaseAdmin();
  const seen = new Set<string>();
  const rows = recipients
    .filter((r) => {
      const key = r.email.toLowerCase();
      if (!r.email || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((r) => ({
      newsletter_id: newsletterId,
      email: r.email,
      first_name: r.first_name,
      signup_id: r.signup_id,
      status: "pending" as const,
    }));

  const CHUNK = 1000;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const slice = rows.slice(i, i + CHUNK);
    const { error } = await db
      .from("newsletter_send_queue")
      .upsert(slice, { onConflict: "newsletter_id,email", ignoreDuplicates: true });
    if (error) {
      console.error("[queue] enqueueRecipients failed:", error.message);
    }
  }
  const counts = await getQueueCounts(newsletterId);
  return counts.pending;
}

/** The next chunk of unclaimed pending recipients (a read-only peek). */
export async function getPendingChunk(
  newsletterId: string,
  limit: number
): Promise<QueueRow[]> {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("newsletter_send_queue")
    .select("id, email, first_name, signup_id")
    .eq("newsletter_id", newsletterId)
    .eq("status", "pending")
    .is("claimed_at", null)
    .order("created_at", { ascending: true })
    .limit(limit);
  if (error) {
    console.error("[queue] getPendingChunk failed:", error.message);
    return [];
  }
  return (data ?? []) as QueueRow[];
}

/**
 * Atomically claim the next chunk and return only the rows THIS caller won.
 * Two workers may pick the same candidates, but the UPDATE (guarded by
 * `claimed_at is null`) lets each row be claimed once — so no recipient is ever
 * sent twice. Call reclaimStale() first to recover claims from dead workers.
 */
export async function claimChunk(
  newsletterId: string,
  limit: number
): Promise<QueueRow[]> {
  const db = supabaseAdmin();
  const candidates = await getPendingChunk(newsletterId, limit);
  if (candidates.length === 0) return [];
  const { data, error } = await db
    .from("newsletter_send_queue")
    .update({ claimed_at: new Date().toISOString() })
    .in(
      "id",
      candidates.map((c) => c.id)
    )
    .eq("status", "pending")
    .is("claimed_at", null)
    .select("id, email, first_name, signup_id");
  if (error) {
    console.error("[queue] claimChunk failed:", error.message);
    return [];
  }
  return (data ?? []) as QueueRow[];
}

/** Reset claims older than `olderThanMs` (a worker that died mid-send). */
export async function reclaimStale(
  newsletterId: string,
  olderThanMs = 180_000
): Promise<void> {
  const db = supabaseAdmin();
  const cutoff = new Date(Date.now() - olderThanMs).toISOString();
  const { error } = await db
    .from("newsletter_send_queue")
    .update({ claimed_at: null })
    .eq("newsletter_id", newsletterId)
    .eq("status", "pending")
    .lt("claimed_at", cutoff);
  if (error) console.error("[queue] reclaimStale failed:", error.message);
}

/** Mark queue rows as sent or failed after a send attempt. */
export async function markQueueRows(
  results: { id: string; ok: boolean; error?: string | null }[]
): Promise<void> {
  const db = supabaseAdmin();
  const sentIds = results.filter((r) => r.ok).map((r) => r.id);
  const failed = results.filter((r) => !r.ok);
  if (sentIds.length) {
    const { error } = await db
      .from("newsletter_send_queue")
      .update({ status: "sent", sent_at: new Date().toISOString(), error: null })
      .in("id", sentIds);
    if (error) console.error("[queue] markQueueRows(sent) failed:", error.message);
  }
  // Update failures individually so each keeps its own error message.
  for (const f of failed) {
    await db
      .from("newsletter_send_queue")
      .update({ status: "failed", error: (f.error ?? "failed").slice(0, 400) })
      .eq("id", f.id);
  }
}

/** Reset a newsletter's failed rows back to pending (for a retry pass). */
export async function requeueFailed(newsletterId: string): Promise<number> {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("newsletter_send_queue")
    .update({ status: "pending", error: null })
    .eq("newsletter_id", newsletterId)
    .eq("status", "failed")
    .select("id");
  if (error) {
    console.error("[queue] requeueFailed failed:", error.message);
    return 0;
  }
  return (data ?? []).length;
}

async function countStatus(newsletterId: string, status: string): Promise<number> {
  const db = supabaseAdmin();
  const { count, error } = await db
    .from("newsletter_send_queue")
    .select("id", { count: "exact", head: true })
    .eq("newsletter_id", newsletterId)
    .eq("status", status);
  if (error) return 0;
  return count ?? 0;
}

export async function getQueueCounts(newsletterId: string): Promise<QueueCounts> {
  const [pending, sent, failed] = await Promise.all([
    countStatus(newsletterId, "pending"),
    countStatus(newsletterId, "sent"),
    countStatus(newsletterId, "failed"),
  ]);
  return { pending, sent, failed, total: pending + sent + failed };
}

/** Newsletter ids that still have pending rows (for the cron to resume). */
export async function newslettersWithPending(limit = 20): Promise<string[]> {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("newsletter_send_queue")
    .select("newsletter_id")
    .eq("status", "pending")
    .limit(5000);
  if (error) {
    console.error("[queue] newslettersWithPending failed:", error.message);
    return [];
  }
  const ids = [...new Set((data ?? []).map((r) => (r as { newsletter_id: string }).newsletter_id))];
  return ids.slice(0, limit);
}
