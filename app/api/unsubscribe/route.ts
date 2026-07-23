import { verifyUnsubscribeToken } from "@/lib/email/links";
import { unsubscribeByEmail } from "@/lib/db/signups";
import { SITE } from "@/lib/constants";

export const runtime = "nodejs";

/** Public, unauthenticated. Validates the signed token before unsubscribing. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const email = (url.searchParams.get("e") || "").trim().toLowerCase();
  const token = url.searchParams.get("t") || "";

  let ok = false;
  if (email && token && verifyUnsubscribeToken(email, token)) {
    ok = await unsubscribeByEmail(email);
  }

  return new Response(page(ok), {
    status: ok ? 200 : 400,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

// Support one-click unsubscribe (RFC 8058: List-Unsubscribe-Post).
export async function POST(req: Request) {
  return GET(req);
}

function page(ok: boolean): string {
  const title = ok ? "We're sorry to see you go" : "Link not valid";
  // Warm, on-brand goodbye: we didn't want them to leave, we're still building,
  // and the door is open for when Klario is fully live.
  const body = ok
    ? "You've been unsubscribed, so we won't email you again. We didn't want to let you go, but we understand. Klario is still being built, and when we're fully live we'd love to welcome you back. Thank you for being early. We hope to see you again soon."
    : "This unsubscribe link is invalid or has expired. If you're still getting emails you don't want, just reply to any of them and we'll take care of it right away.";
  const cta = ok ? "Changed your mind? Re-join" : "Back to Klario";
  const ctaHref = ok ? `${SITE.url}/beta` : SITE.url;
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title} | Klario</title></head>
<body style="margin:0;background:#ECEAE3;font-family:'Plus Jakarta Sans',-apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#080808;">
<div style="max-width:500px;margin:12vh auto;padding:44px 32px;background:#fff;border-radius:22px;box-shadow:0 16px 50px rgba(60,40,20,.12);text-align:center;">
<div style="font-size:24px;font-weight:800;letter-spacing:-.5px;color:#080808;">Klario<span style="color:#c19a6b;">.</span></div>
<div style="width:44px;height:1px;background:#c19a6b;opacity:.5;margin:22px auto;"></div>
<h1 style="font-size:23px;line-height:1.25;margin:0 0 14px;font-weight:800;letter-spacing:-.4px;">${title}</h1>
<p style="font-size:15px;line-height:1.65;color:#5a5148;margin:0 0 28px;">${body}</p>
<a href="${ctaHref}" style="display:inline-block;background:#c19a6b;color:#080808;font-weight:700;text-decoration:none;padding:13px 26px;border-radius:12px;font-size:14px;">${cta}</a>
</div></body></html>`;
}
