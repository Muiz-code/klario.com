import { appSupabaseAdmin } from "@/lib/supabase/appAdmin";
import { chunk } from "@/lib/db/appQuery";
import { MAX_RECIPIENTS, type MessageCategory } from "@/lib/appMessageKinds";

/**
 * In-app messages to Klario app users, sent from this admin.
 *
 * Delivery mirrors the path Kairo-Admin already uses in production, because
 * that one is proven to reach devices:
 *
 *   1. Bulk-insert `notifications` rows — the in-app bell, and the source of
 *      truth for whether a message landed.
 *   2. Push to Expo DIRECTLY, in batches of 100.
 *
 * An earlier version called the app's `send-push-notification` edge function
 * once per user. That's one HTTP round-trip per recipient and it failed in
 * practice, while the same user received a push fine from Kairo-Admin — so the
 * function is not the reliable route from here. Pushing directly also means a
 * send is a couple of queries plus a few batched calls, however many people
 * it goes to.
 *
 * Every send is recorded in the app's `broadcasts` table, which exists for
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
  /** In-app notifications written — everyone who actually got the message. */
  delivered: number;
  /** Of those, how many Expo accepted a push for (no push token = in-app only). */
  pushed: number;
  /** Silenced by the user's own notification settings. */
  skipped: number;
  failed: number;
  /** First error seen, so a broken send says why instead of just "failed". */
  error?: string;
};

/** Expo takes up to 100 messages per request. */
const PUSH_CHUNK = 100;
const INSERT_CHUNK = 500;
const EXPO_SEND = "https://exp.host/--/api/v2/push/send";

/**
 * `broadcast_*` is what the app's prefKeyFor maps to the announcements toggle,
 * and what Kairo-Admin already writes — keep both admins on the same type so
 * the app treats their messages identically.
 */
const typeFor = (category: MessageCategory) => `broadcast_${category}`;

/** A token only counts if Expo hasn't already told us the install is gone. */
function isLivePushToken(token: unknown, deadAt: unknown): boolean {
  if (deadAt) return false;
  return typeof token === "string" && token.startsWith("ExponentPushToken");
}

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

  const result: SendResult = { delivered: 0, pushed: 0, skipped: 0, failed: 0 };
  const note = (e: unknown) => {
    const msg = e instanceof Error ? e.message : String(e ?? "unknown error");
    if (!result.error) result.error = msg;
    console.error("[appmsg]", msg);
  };

  // One read for everything the send needs: who has muted announcements, and
  // who has a live push token.
  //
  // `push_dead_at` is added by Kairo-Admin's migration, so it may not exist in
  // every environment — fall back to reading without it rather than failing the
  // whole send over a missing column.
  const COLS = "id, notification_prefs, expo_push_token, push_dead_at";
  const COLS_NO_DEAD = "id, notification_prefs, expo_push_token";
  let cols = COLS;

  type Target = { id: string; token: string | null };
  const targets: Target[] = [];
  for (const slice of chunk(ids, 300)) {
    let { data, error } = await db.from("profiles").select(cols).in("id", slice);
    if (error && cols === COLS) {
      cols = COLS_NO_DEAD;
      ({ data, error } = await db.from("profiles").select(cols).in("id", slice));
    }
    if (error) {
      note(error);
      continue;
    }
    for (const raw of data ?? []) {
      const row = raw as unknown as Record<string, unknown>;
      const prefs = row.notification_prefs as Record<string, boolean> | null;
      if (prefs?.announcements === false) {
        result.skipped += 1;
        continue;
      }
      targets.push({
        id: String(row.id),
        token: isLivePushToken(row.expo_push_token, row.push_dead_at)
          ? String(row.expo_push_token)
          : null,
      });
    }
  }

  const data = { broadcast: true, category: opts.category, source: "marketing-admin" };

  // 1. The in-app bell. This is delivery — a push that fails is a lost buzz,
  //    not a lost message.
  for (const batch of chunk(targets, INSERT_CHUNK)) {
    const { error } = await db.from("notifications").insert(
      batch.map((t) => ({
        user_id: t.id,
        title: opts.title,
        body: opts.body,
        type: typeFor(opts.category),
        read: false,
        data,
      }))
    );
    if (error) {
      note(error);
      result.failed += batch.length;
    } else {
      result.delivered += batch.length;
    }
  }

  // 2. Push, straight to Expo, 100 at a time. Never fails the send.
  const pushable = targets.filter((t) => t.token);
  for (const batch of chunk(pushable, PUSH_CHUNK)) {
    try {
      const res = await fetch(EXPO_SEND, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          batch.map((t) => ({
            to: t.token,
            title: opts.title,
            body: opts.body,
            data,
            sound: "default",
          }))
        ),
        signal: AbortSignal.timeout(10_000),
      });
      const json = (await res.json().catch(() => null)) as {
        data?: { status?: string; message?: string }[];
        errors?: { message?: string }[];
      } | null;
      if (!res.ok) {
        note(json?.errors?.[0]?.message ?? `Expo HTTP ${res.status}`);
        continue;
      }
      for (const ticket of json?.data ?? []) {
        if (ticket?.status === "ok") result.pushed += 1;
        else note(ticket?.message ?? "push rejected");
      }
    } catch (e) {
      note(e);
    }
  }

  // History row, so the app's own broadcast list shows what was sent.
  const { error } = await db.from("broadcasts").insert({
    admin_email: opts.actorEmail,
    title: opts.title,
    body: opts.body,
    category: opts.category,
    audience: opts.audience.slice(0, 200),
    // Recipients = who actually got the in-app message; pushed = how many of
    // those Expo also accepted a push for.
    recipients: result.delivered,
    pushed: result.pushed,
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
