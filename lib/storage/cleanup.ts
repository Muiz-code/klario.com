import { supabaseAdmin } from "@/lib/supabase/admin";
import { listNewsletters } from "@/lib/db/newsletters";

const BUCKET = "email-assets";

/**
 * Frees space in the email-assets bucket by deleting images that are no longer
 * worth keeping, in two cases:
 *
 *  1. Orphans: not referenced by any newsletter (abandoned composes, test
 *     uploads). Only removed once older than `graceMinutes`, so an in-progress
 *     compose is never wiped.
 *  2. Aged campaigns: referenced ONLY by newsletters sent more than
 *     `purgeAfterHours` ago. By then nearly all opens have happened, so we
 *     reclaim the space (very late opens may show a broken image).
 *
 * Drafts and recently-sent campaigns (within `purgeAfterHours`) are protected,
 * so their images stay live.
 */
export async function cleanupOrphanImages(opts?: {
  graceMinutes?: number;
  purgeAfterHours?: number;
}): Promise<{ deleted: number; kept: number; freedBytes: number }> {
  const graceMinutes = opts?.graceMinutes ?? 120;
  const purgeAfterHours = opts?.purgeAfterHours ?? 48;
  const db = supabaseAdmin();

  const newsletters = await listNewsletters();
  const protectMs = Date.now() - purgeAfterHours * 60 * 60 * 1000;

  // Paths referenced by any newsletter at all.
  const referenced = new Set<string>();
  // Paths still protected: drafts, or campaigns sent within the purge window.
  const protectedPaths = new Set<string>();

  const pathsOf = (html: string): string[] =>
    [...html.matchAll(/email-assets\/([^"'\)\s]+)/g)].map((m) =>
      decodeURIComponent(m[1])
    );

  for (const n of newsletters) {
    const recentlySent =
      n.status === "sent" && n.sent_at
        ? new Date(n.sent_at).getTime() > protectMs
        : false;
    const isDraft = n.status !== "sent";
    const keep = isDraft || recentlySent;
    for (const p of pathsOf(n.html)) {
      referenced.add(p);
      if (keep) protectedPaths.add(p);
    }
  }

  // List all objects in the bucket (uploads are stored as <date>/<file>).
  const cutoff = Date.now() - graceMinutes * 60 * 1000;
  const toDelete: string[] = [];
  let kept = 0;
  let freedBytes = 0;

  const { data: folders, error: topErr } = await db.storage
    .from(BUCKET)
    .list("", { limit: 1000 });
  if (topErr) {
    console.error("[storage] cleanup list failed:", topErr.message);
    return { deleted: 0, kept: 0, freedBytes: 0 };
  }

  for (const folder of folders ?? []) {
    // Files live one level down inside date folders.
    const { data: files } = await db.storage
      .from(BUCKET)
      .list(folder.name, { limit: 1000 });
    for (const f of files ?? []) {
      const path = `${folder.name}/${f.name}`;
      const created = f.created_at ? new Date(f.created_at).getTime() : 0;
      const size = (f.metadata?.size as number | undefined) ?? 0;

      if (protectedPaths.has(path)) {
        // Used by a draft or a campaign sent within the purge window.
        kept++;
      } else if (referenced.has(path)) {
        // Referenced only by campaigns sent > purgeAfterHours ago: purge it.
        toDelete.push(path);
        freedBytes += size;
      } else if (created > cutoff) {
        // Unreferenced but still within the grace window (maybe an active
        // compose): keep for now.
        kept++;
      } else {
        // Aged orphan: remove.
        toDelete.push(path);
        freedBytes += size;
      }
    }
  }

  if (toDelete.length === 0) return { deleted: 0, kept, freedBytes: 0 };

  const { error: rmErr } = await db.storage.from(BUCKET).remove(toDelete);
  if (rmErr) {
    console.error("[storage] cleanup remove failed:", rmErr.message);
    return { deleted: 0, kept, freedBytes: 0 };
  }

  return { deleted: toDelete.length, kept, freedBytes };
}
