import type { Metadata } from "next";
import { appSupabaseAdmin } from "@/lib/supabase/appAdmin";
import { InviteLanding, type InvitePreview } from "@/components/invite/InviteLanding";

/**
 * klario.finance/invite?token=…
 *
 * Where the button in a business invitation email lands. The invitation
 * itself is accepted in the Klario app; this page's whole job is to get the
 * person there: open the app if it is installed, otherwise send them to the
 * store and tell them to tap the link again once it is.
 *
 * The preview (who is inviting, as what, to which address) is read from the
 * app's database through the server-only client, so the page can say what the
 * link is for before anyone has the app. The token is the secret, so nothing
 * here needs a session. Never indexed: every URL is one person's.
 */
export const metadata: Metadata = {
  title: "You've been invited | Klario",
  description: "Accept a business invitation in the Klario app.",
  robots: { index: false, follow: false },
};

async function loadPreview(token: string): Promise<InvitePreview | null> {
  const db = appSupabaseAdmin();
  if (!db) return null;
  try {
    const { data } = await db.rpc("org_invite_preview", { p_token: token });
    const row = Array.isArray(data) ? data[0] : data;
    if (!row) return null;
    return {
      orgName: String(row.org_name ?? "A business"),
      roleLabel: String(row.role_label ?? "member"),
      email: String(row.email ?? ""),
      expired: Boolean(row.expired),
      invitedBy: row.invited_by_name ? String(row.invited_by_name) : null,
    };
  } catch {
    return null;
  }
}

export default async function InvitePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const preview = token ? await loadPreview(token) : null;
  return <InviteLanding token={token ?? null} preview={preview} />;
}
