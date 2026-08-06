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
 * Ceiling for one send. Each recipient is a call to the app's edge function, at
 * roughly 16/second with the sender's concurrency, so 2,000 finishes inside the
 * route's 300s budget with room to spare.
 */
export const MAX_RECIPIENTS = 2000;

/** Up to this many, we deliver before responding and report exact numbers. */
export const SYNC_LIMIT = 250;
