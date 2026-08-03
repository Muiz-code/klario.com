/**
 * The admin capabilities a role can be granted — one per area of the admin.
 * A role is a set of these; a superadmin implicitly has all of them. Paths map
 * a URL to the capability that guards it (used by the sidebar and page guards).
 */
export const CAPABILITIES = [
  { key: "overview", label: "Overview & analytics", paths: ["/marketing/dashboard", "/marketing/analytics", "/marketing/reports"] },
  { key: "compose", label: "Compose & send mail (incl. automations)", paths: ["/marketing/newsletters", "/marketing/automations"] },
  { key: "campaigns", label: "Email templates", paths: ["/marketing/templates"] },
  { key: "segments", label: "Segments", paths: ["/marketing/segments"] },
  { key: "audience", label: "Audience & submissions", paths: ["/marketing/subscribers", "/marketing/submissions"] },
  { key: "beta", label: "Beta responses", paths: ["/marketing/beta"] },
  { key: "anchor", label: "Anchor Club", paths: ["/marketing/anchor-club"] },
  { key: "app_users", label: "App users (usage + money)", paths: ["/marketing/app-users"] },
  { key: "blog", label: "Blog", paths: ["/marketing/blog"] },
  { key: "audit", label: "Audit log", paths: ["/marketing/audit"] },
  { key: "test_lab", label: "Test lab", paths: ["/marketing/test-lab"] },
  { key: "settings", label: "Settings", paths: ["/marketing/settings"] },
] as const;

export type Capability = (typeof CAPABILITIES)[number]["key"];

export const ALL_CAPABILITIES: Capability[] = CAPABILITIES.map((c) => c.key);

const KEYS = new Set<string>(ALL_CAPABILITIES);
export function isCapability(v: unknown): v is Capability {
  return typeof v === "string" && KEYS.has(v);
}

/** The capability that guards a given admin path, or null if unguarded. */
export function capabilityForPath(path: string): Capability | null {
  for (const c of CAPABILITIES) {
    if (c.paths.some((p) => path === p || path.startsWith(p + "/"))) return c.key;
  }
  return null;
}

// Maps the first segment of an /api/admin/<group> path to the capability that
// guards it. Groups not listed (team, upload-image) are allowed for any admin —
// team routes self-guard superadmin; upload-image is a shared utility.
const API_CAPABILITY: Record<string, Capability> = {
  analytics: "overview",
  "resend-usage": "overview",
  newsletters: "compose", // compose + send mail
  email: "compose", // resend failed sends = a sending action
  automations: "compose", // automations send mail → require compose
  templates: "campaigns", // managing templates doesn't send
  "send-invite": "compose", // sends an invite email → require compose
  segments: "segments",
  subscribers: "audience",
  submissions: "audience",
  import: "audience",
  duplicates: "audience",
  beta: "beta",
  anchor: "anchor",
  "app-users": "app_users",
  blog: "blog",
  audit: "audit",
  storage: "audit",
  "resend-emails": "audit",
  "resend-recipients": "audit",
  "resend-reconcile": "audit",
  "test-users": "test_lab",
  settings: "settings",
};

/** The capability guarding an /api/admin/... route, or null if unguarded. */
export function apiCapabilityForPath(path: string): Capability | null {
  const m = path.match(/^\/api\/admin\/([^/?]+)/);
  return (m && API_CAPABILITY[m[1]]) ?? null;
}

/** The first path a set of capabilities can reach — a safe redirect target for
 *  a member who hits a section they can't access. Falls back to /no-access. */
export function firstAllowedPath(caps: Iterable<string>): string {
  const held = new Set(caps);
  for (const c of CAPABILITIES) {
    if (held.has(c.key)) return c.paths[0];
  }
  return "/marketing/no-access";
}
