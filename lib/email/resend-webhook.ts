/**
 * Verifies a Resend webhook using the Svix signature scheme (Resend signs
 * webhooks with Svix). Returns true only when one of the provided signatures
 * matches an HMAC-SHA256 of `${id}.${timestamp}.${body}` keyed by the secret.
 */
export async function verifyResendWebhook(opts: {
  secret: string; // whsec_... from the Resend dashboard
  id: string | null;
  timestamp: string | null;
  signature: string | null; // "v1,<sig> v1,<sig2>"
  body: string; // raw request body
}): Promise<boolean> {
  const { secret, id, timestamp, signature, body } = opts;
  if (!secret || !id || !timestamp || !signature) return false;

  const keyB64 = secret.startsWith("whsec_") ? secret.slice(6) : secret;
  let keyBytes: ArrayBuffer;
  try {
    const buf = Buffer.from(keyB64, "base64");
    keyBytes = buf.buffer.slice(
      buf.byteOffset,
      buf.byteOffset + buf.byteLength
    );
  } catch {
    return false;
  }

  const signedContent = `${id}.${timestamp}.${body}`;
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sigBuf = await crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    new TextEncoder().encode(signedContent) as unknown as ArrayBuffer
  );
  const expected = Buffer.from(new Uint8Array(sigBuf)).toString("base64");

  // The header is a space-separated list of "version,signature" pairs.
  const provided = signature
    .split(" ")
    .map((p) => p.split(",")[1])
    .filter(Boolean);

  return provided.some((p) => timingSafeEqual(p, expected));
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}
