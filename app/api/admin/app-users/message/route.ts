import { NextResponse, after } from "next/server";
import { requireApiCapability } from "@/lib/auth/access";
import { normalizeEmail } from "@/lib/duplicates";
import { getAppProfilesByEmails } from "@/lib/db/appProfiles";
import {
  sendAppMessage,
  isMessageCategory,
  MAX_RECIPIENTS,
  SYNC_LIMIT,
} from "@/lib/db/appMessages";
import { logAction } from "@/lib/db/adminActivity";

export const runtime = "nodejs";
export const maxDuration = 300;

const MAX_TITLE = 120; // matches the app's broadcasts check constraint
const MAX_BODY = 1000;

/**
 * Send an in-app message to Klario app users, by email.
 * body: { emails: string[], title, body, category?, audience? }
 *
 * Emails with no app account are reported back as `notOnApp` rather than
 * failing the send — the caller's selection can legitimately include contacts
 * who never installed. Delivery honours each user's notification settings, so
 * `skipped` is a normal outcome, not an error.
 */
export async function POST(req: Request) {
  const access = await requireApiCapability("app_users");
  if (!access) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const title = typeof body.title === "string" ? body.title.trim().slice(0, MAX_TITLE) : "";
  const text = typeof body.body === "string" ? body.body.trim().slice(0, MAX_BODY) : "";
  if (!title || !text) {
    return NextResponse.json(
      { error: "A title and a message are both required." },
      { status: 400 }
    );
  }

  const category = isMessageCategory(body.category) ? body.category : "update";
  const audience =
    typeof body.audience === "string" && body.audience.trim()
      ? body.audience.trim()
      : "selected app users";

  const emails = Array.isArray(body.emails)
    ? [
        ...new Set(
          body.emails
            .filter((e): e is string => typeof e === "string")
            .map((e) => normalizeEmail(e))
            .filter(Boolean)
        ),
      ]
    : [];
  if (emails.length === 0) {
    return NextResponse.json({ error: "No recipients selected." }, { status: 400 });
  }
  if (emails.length > MAX_RECIPIENTS) {
    return NextResponse.json(
      {
        error: `That's ${emails.length} people — send to at most ${MAX_RECIPIENTS} at a time.`,
      },
      { status: 400 }
    );
  }

  const profiles = await getAppProfilesByEmails(emails);
  const userIds = [...profiles.values()].map((p) => p.id).filter(Boolean);
  const notOnApp = emails.length - userIds.length;

  if (userIds.length === 0) {
    return NextResponse.json(
      { error: "None of those emails have a Klario app account." },
      { status: 400 }
    );
  }

  const send = { userIds, title, body: text, category, actorEmail: access.email, audience };

  // Big sends run after the response so the admin isn't staring at a spinner
  // for minutes. The broadcast row and the audit entry are still written when
  // it finishes, so the outcome is never lost — it just lands a bit later.
  if (userIds.length > SYNC_LIMIT) {
    after(async () => {
      const result = await sendAppMessage(send);
      await logAction("app_message.send", {
        target: title,
        meta: {
          audience,
          category,
          recipients: userIds.length,
          background: true,
          ...(result ?? { failed: userIds.length }),
        },
      });
    });
    return NextResponse.json({
      ok: true,
      queued: true,
      recipients: userIds.length,
      notOnApp,
    });
  }

  const result = await sendAppMessage(send);
  if (!result) {
    return NextResponse.json(
      { error: "The app database is not linked, so nothing was sent." },
      { status: 502 }
    );
  }

  await logAction("app_message.send", {
    target: title,
    meta: { audience, category, recipients: userIds.length, ...result },
  });

  return NextResponse.json({ ok: true, ...result, notOnApp });
}
