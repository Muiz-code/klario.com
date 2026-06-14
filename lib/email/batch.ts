import { resend, RESEND_FROM, RESEND_REPLY_TO } from "./client";

export type BatchMessage = {
  to: string;
  subject: string;
  html: string;
  text: string;
  headers?: Record<string, string>;
};

export type BatchResult = {
  to: string;
  ok: boolean;
  id?: string;
  error?: string;
};

const CHUNK = 100; // Resend batch endpoint maximum per call.

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

/**
 * Send many emails via the Resend batch endpoint, chunked at 100 per call.
 * Returns one result per input message, in the same order. A chunk-level
 * failure marks every message in that chunk as failed (never as sent), so the
 * caller can safely use the result to decide what to mark invited / log.
 */
export async function sendBatch(messages: BatchMessage[]): Promise<BatchResult[]> {
  const results: BatchResult[] = [];

  for (const group of chunk(messages, CHUNK)) {
    try {
      const payload = group.map((m) => ({
        from: RESEND_FROM,
        to: [m.to],
        replyTo: RESEND_REPLY_TO,
        subject: m.subject,
        html: m.html,
        text: m.text,
        headers: m.headers,
      }));

      const { data, error } = await resend.batch.send(payload);

      if (error) {
        for (const m of group) {
          results.push({ to: m.to, ok: false, error: error.message });
        }
        continue;
      }

      const ids = data?.data ?? [];
      group.forEach((m, i) => {
        const id = ids[i]?.id;
        results.push({ to: m.to, ok: Boolean(id), id, error: id ? undefined : "No id returned" });
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      for (const m of group) results.push({ to: m.to, ok: false, error: msg });
    }
  }

  return results;
}
