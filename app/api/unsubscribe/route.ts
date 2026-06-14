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
  const title = ok ? "You're unsubscribed" : "Link not valid";
  const body = ok
    ? "You will no longer receive Klario beta emails. Changed your mind? Just sign up again on the site."
    : "This unsubscribe link is invalid or has expired. If you keep getting emails, reply to any of them and we will remove you.";
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title} — Klario</title></head>
<body style="margin:0;background:#ECEAE3;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#0E1116;">
<div style="max-width:480px;margin:12vh auto;padding:40px 28px;background:#fff;border-radius:20px;box-shadow:0 8px 30px rgba(14,17,22,.1);text-align:center;">
<div style="font-size:22px;font-weight:800;letter-spacing:-.5px;">Klario<span style="color:#19C37D;">.</span></div>
<h1 style="font-size:22px;margin:24px 0 12px;">${title}</h1>
<p style="font-size:15px;line-height:1.6;color:#4A5159;margin:0 0 24px;">${body}</p>
<a href="${SITE.url}" style="display:inline-block;background:#19C37D;color:#0E1116;font-weight:700;text-decoration:none;padding:12px 24px;border-radius:12px;font-size:14px;">Back to klario.finance</a>
</div></body></html>`;
}
