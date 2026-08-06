import { appSupabaseAdmin } from "@/lib/supabase/appAdmin";
import { chunk } from "@/lib/db/appQuery";
import { MAX_RECIPIENTS, type MessageCategory } from "@/lib/appMessageKinds";

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

export {
  MESSAGE_CATEGORIES,
  isMessageCategory,
  MAX_RECIPIENTS,
  SYNC_LIMIT,
  type MessageCategory,
} from "@/lib/appMessageKinds";

export type SendResult = {
  /** Went through the app's function — bell entry plus a push if they have a token. */
  delivered: number;
  /** The function was unreachable, so we wrote the bell entry ourselves: no push. */
  inAppOnly: number;
  /** Silenced by the user's own notification settings. */
  skipped: number;
  failed: number;
  /** First error seen, so a broken send says why instead of just "failed". */
  error?: string;
};

const CONCURRENCY = 8;

/** The notification type that maps to the app's "announcements" preference. */
const MESSAGE_TYPE = "admin_message";

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

  const result: SendResult = { delivered: 0, inAppOnly: 0, skipped: 0, failed: 0 };
  const note = (e: unknown) => {
    const msg = e instanceof Error ? e.message : String(e ?? "unknown error");
    if (!result.error) result.error = msg;
    console.error("[appmsg] send-push-notification failed:", msg);
  };

  // Honour the announcements toggle here rather than burning a function call
  // per silenced user. (The function checks it too — this is the same rule,
  // applied earlier.)
  const silenced = new Set<string>();
  for (const slice of chunk(ids, 300)) {
    const { data } = await db
      .from("profiles")
      .select("id, notification_prefs")
      .in("id", slice);
    for (const row of data ?? []) {
      const prefs = (row as { notification_prefs?: Record<string, boolean> | null })
        .notification_prefs;
      if (prefs?.announcements === false) silenced.add(String((row as { id: string }).id));
    }
  }
  result.skipped = ids.filter((id) => silenced.has(id)).length;
  const targets = ids.filter((id) => !silenced.has(id));

  const payload = {
    title: opts.title,
    body: opts.body,
    type: MESSAGE_TYPE,
    data: { category: opts.category, source: "marketing-admin" },
  };

  for (const batch of chunk(targets, CONCURRENCY)) {
    await Promise.all(
      batch.map(async (userId) => {
        try {
          const { data, error } = await db.functions.invoke("send-push-notification", {
            body: { user_id: userId, ...payload },
          });
          if (error) throw error;
          if ((data as { skipped?: string } | null)?.skipped) result.skipped += 1;
          else result.delivered += 1;
          return;
        } catch (e) {
          note(e);
        }

        // The function is how a message also becomes a PUSH. If it's
        // unreachable, still write the in-app notification directly so the
        // message isn't lost — it just won't buzz their phone.
        const { error: insertError } = await db.from("notifications").insert({
          user_id: userId,
          title: opts.title,
          body: opts.body,
          type: MESSAGE_TYPE,
          data: payload.data,
          read: false,
        });
        if (insertError) {
          note(insertError);
          result.failed += 1;
        } else {
          result.inAppOnly += 1;
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
    // `pushed` counts only what actually went through the push path.
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
