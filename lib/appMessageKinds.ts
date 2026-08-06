/**
 * Shapes and limits for in-app messages — no DB, no secrets, so the composer
 * (a Client Component) can import these without dragging the service-role app
 * client into the browser bundle. The sending logic lives in
 * lib/db/appMessages.ts, which is server-only.
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

/**
 * Ceiling for one send. Delivery is bulk-insert (500 rows a query) plus Expo
 * pushes (100 a request), so 10,000 people is ~20 queries and ~100 calls —
 * comfortably inside the route's 300s budget. This is a sanity bound, not a
 * throughput limit.
 */
export const MAX_RECIPIENTS = 10000;

/** Up to this many, we deliver before responding and report exact numbers. */
export const SYNC_LIMIT = 2000;
