import { appSupabaseAdmin } from "@/lib/supabase/appAdmin";
import { chunk } from "@/lib/db/appQuery";

/**
 * In-app messages to Klario app users, sent from this admin.
 *
 * Delivery goes through the APP's own `send-push-notification` edge function
 * rather than writing rows ourselves, because that function is where the rules
 * live: it honours each user's notification preferences (an admin message maps
 * to their "announcements" toggle), writes the in-app bell entry, and pushes to
 * their device only if they have a valid Expo token. Reimplementing that here
 * would drift from the app.
 *
 * Every send is also recorded in the app's `broadcasts` table, which exists for
 * exactly this ("one row per send, holding the content plus delivery stats").
 */

export type MessageCategory = "update" | "tip" | "fun" | "promo";

export const MESSAGE_CATEGORIES: { key: MessageCategory; label: string; hint: string }[] = [
  { key: "update", label: "Update", hint: "Product news and changes" },
  { key: "tip", label: "Tip", hint: "Money advice or a nudge" },
  { key: "fun", label: "Fun", hint: "Light, personality-led" },
  { key: "promo", label: "Promo", hint: "Offers and upgrades" },
];

export function isMessageCategory(v: unknown): v is MessageCategory {
  return v === "update" || v === "tip" || v === "fun" || v === "promo";
}

export type SendResult = {
  delivered: number;
  /** Silenced by the user's own notification settings. */
  skipped: number;
  failed: number;
};

/** How many users one request will message — keeps us inside the time budget. */
export const MAX_RECIPIENTS = 500;
const CONCURRENCY = 8;

/**
 * Send one message to a set of app user ids. Returns per-recipient outcomes;
 * a single failure never aborts the rest.
 */
export async function sendAppMessage(opts: {
  userIds: string[];
  title: string;
  body: string;
  category: MessageCategory;
  actorEmail: string;
  /** Human description of who this went to, stored on the broadcast row. */
  audience: string;
}): Promise<SendResult | null> {
  const db = appSupabaseAdmin();
  const ids = [...new Set(opts.userIds.filter(Boolean))].slice(0, MAX_RECIPIENTS);
  if (!db || ids.length === 0) return null;

  const result: SendResult = { delivered: 0, skipped: 0, failed: 0 };

  for (const batch of chunk(ids, CONCURRENCY)) {
    await Promise.all(
      batch.map(async (userId) => {
        try {
          const { data, error } = await db.functions.invoke("send-push-notification", {
            body: {
              user_id: userId,
              title: opts.title,
              body: opts.body,
              // `admin_message` is the type the app maps to the announcements
              // preference — don't rename it without changing prefKeyFor there.
              type: "admin_message",
              data: { category: opts.category, source: "marketing-admin" },
            },
          });
          if (error) {
            result.failed += 1;
            return;
          }
          if ((data as { skipped?: string } | null)?.skipped) result.skipped += 1;
          else result.delivered += 1;
        } catch {
          result.failed += 1;
        }
      })
    );
  }

  // History row, so the app's own broadcast list shows what was sent.
  const { error } = await db.from("broadcasts").insert({
    admin_email: opts.actorEmail,
    title: opts.title,
    body: opts.body,
    category: opts.category,
    audience: opts.audience.slice(0, 200),
    recipients: ids.length,
    pushed: result.delivered,
  });
  if (error) console.error("[appdb] broadcast history failed:", error.message);

  return result;
}

export type AppBroadcast = {
  id: string;
  admin_email: string | null;
  title: string;
  body: string;
  category: string;
  audience: string;
  recipients: number;
  pushed: number;
  created_at: string;
};

/** Recent in-app messages, newest first. Empty when the app DB isn't linked. */
export async function listAppBroadcasts(limit = 50): Promise<AppBroadcast[]> {
  const db = appSupabaseAdmin();
  if (!db) return [];
  const { data, error } = await db
    .from("broadcasts")
    .select("id, admin_email, title, body, category, audience, recipients, pushed, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("[appdb] listAppBroadcasts failed:", error.message);
    return [];
  }
  return (data ?? []) as AppBroadcast[];
}
