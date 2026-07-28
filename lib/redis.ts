/**
 * Distributed coordination via Upstash Redis (REST) — for cross-instance rate
 * limiting, caching, and job locks. Serverless functions each have their own
 * memory, so in-process limiters/caches don't hold globally; Redis does.
 *
 * GRACEFUL DEGRADE: if UPSTASH_REDIS_REST_URL / _TOKEN aren't set, every helper
 * becomes a safe no-op and callers fall back to their in-process behaviour. So
 * the app works with or without Upstash — wiring it up just makes the guarantees
 * global. No package needed: we talk to Upstash's REST API with fetch.
 *
 * Set up: create an Upstash Redis DB, then add to the environment:
 *   UPSTASH_REDIS_REST_URL=https://<name>.upstash.io
 *   UPSTASH_REDIS_REST_TOKEN=<token>
 */

const URL_ENV = process.env.UPSTASH_REDIS_REST_URL;
const TOKEN_ENV = process.env.UPSTASH_REDIS_REST_TOKEN;

export function redisAvailable(): boolean {
  return Boolean(URL_ENV && TOKEN_ENV);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Run a single Redis command; returns its result, or throws on transport error. */
async function command(args: (string | number)[]): Promise<unknown> {
  const res = await fetch(URL_ENV as string, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN_ENV}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
  });
  const data = (await res.json()) as { result?: unknown; error?: string };
  if (data.error) throw new Error(data.error);
  return data.result;
}

/** Best-effort command — never throws (Redis must not take the app down). */
async function safe(args: (string | number)[]): Promise<unknown> {
  if (!redisAvailable()) return null;
  try {
    return await command(args);
  } catch (e) {
    console.error("[redis]", (e as Error).message);
    return null;
  }
}

// ───────────────────────── Cross-instance rate limit ─────────────────────────

/**
 * Block until this caller is allowed under a global fixed-window limit of
 * `limit` per `windowMs`, shared across ALL instances. No-op without Redis (the
 * caller's in-process limiter is then the only guard).
 */
export async function rateLimitWait(
  key: string,
  limit: number,
  windowMs = 1000
): Promise<void> {
  if (!redisAvailable()) return;
  for (let i = 0; i < 50; i++) {
    const bucket = Math.floor(Date.now() / windowMs);
    const k = `rl:${key}:${bucket}`;
    const count = Number(await safe(["INCR", k])) || 0;
    if (count === 1) await safe(["PEXPIRE", k, windowMs * 2]);
    if (count === 0 || count <= limit) return; // count===0 => Redis down, allow
    await sleep(windowMs - (Date.now() % windowMs) + 5);
  }
}

// ─────────────────────────────── Job locks ──────────────────────────────────

/**
 * Run `fn` while holding a global lock; if another instance holds it, skip and
 * return null. Without Redis it always runs (no cross-instance guarantee).
 */
export async function withLock<T>(
  key: string,
  ttlSec: number,
  fn: () => Promise<T>
): Promise<T | null> {
  if (!redisAvailable()) return fn();
  const token = `${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
  const ok = await safe(["SET", `lock:${key}`, token, "NX", "EX", ttlSec]);
  if (ok !== "OK") return null; // someone else holds it
  try {
    return await fn();
  } finally {
    // Release only if we still own it (compare-and-delete).
    await safe([
      "EVAL",
      "if redis.call('get',KEYS[1])==ARGV[1] then return redis.call('del',KEYS[1]) else return 0 end",
      "1",
      `lock:${key}`,
      token,
    ]);
  }
}

// ────────────────────────── Cross-instance cache ────────────────────────────

export async function cacheGetJSON<T>(key: string): Promise<T | null> {
  const v = await safe(["GET", `cache:${key}`]);
  if (v == null || typeof v !== "string") return null;
  try {
    return JSON.parse(v) as T;
  } catch {
    return null;
  }
}

export async function cacheSetJSON(
  key: string,
  value: unknown,
  ttlSec: number
): Promise<void> {
  await safe(["SET", `cache:${key}`, JSON.stringify(value), "EX", ttlSec]);
}
