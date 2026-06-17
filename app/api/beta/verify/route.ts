import { verifyBetaToken } from "@/lib/email/links";
import { markVerified } from "@/lib/db/betaResponses";
import { SITE } from "@/lib/constants";

export const runtime = "nodejs";

function page(opts: { ok: boolean; heading: string; body: string }): Response {
  const gold = "#D4A853";
  const noir = "#0B0B0E";
  const cream = "#ECE6D8";
  const dim = "#a9a499";
  const html = `<!doctype html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark"><title>Klario beta</title></head>
<body style="margin:0;background:${noir};color:${cream};font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<div style="min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:24px;">
  <div style="width:60px;height:60px;border-radius:50%;background:${opts.ok ? "rgba(123,196,127,.15)" : "rgba(232,136,136,.15)"};display:flex;align-items:center;justify-content:center;margin-bottom:22px;font-size:28px;color:${opts.ok ? "#7BC47F" : "#e88"};">${opts.ok ? "&#10003;" : "&#33;"}</div>
  <h1 style="font-size:26px;font-weight:700;color:#fff;margin:0 0 12px;">${opts.heading}</h1>
  <p style="color:${dim};max-width:420px;margin:0 0 26px;line-height:1.6;">${opts.body}</p>
  <a href="${SITE.url}" style="display:inline-block;background:${gold};color:${noir};text-decoration:none;font-weight:600;padding:13px 26px;border-radius:11px;">Go to klario.finance</a>
</div></body></html>`;
  return new Response(html, {
    status: opts.ok ? 200 : 400,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

/** Confirm a beta respondent's email. Linked from the confirmation email. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const email = (url.searchParams.get("e") || "").trim();
  const token = url.searchParams.get("t") || "";

  if (!email || !token || !verifyBetaToken(email, token)) {
    return page({
      ok: false,
      heading: "This link looks off",
      body: "We couldn't verify this link. It may have been mistyped. Try clicking the button in your email again.",
    });
  }

  await markVerified(email);
  return page({
    ok: true,
    heading: "Email confirmed",
    body: "You're verified and your spot is locked in. We'll be in touch as soon as the beta opens up.",
  });
}
