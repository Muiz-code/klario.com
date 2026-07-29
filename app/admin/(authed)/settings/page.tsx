import { Settings } from "lucide-react";
import { ComingSoon } from "../_components/ComingSoon";
import { getAccess } from "@/lib/auth/access";
import { listMembers, listRoles } from "@/lib/db/rbac";
import { listMemberActivity } from "@/lib/db/adminActivity";
import { CAPABILITIES } from "@/lib/auth/capabilities";
import { TeamView } from "./TeamView";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const access = await getAccess();

  // Team & roles management: superadmins or members granted `settings`.
  const canManageTeam = !!access && (access.isSuperadmin || access.capabilities.has("settings"));
  if (!canManageTeam) {
    return (
      <ComingSoon
        title="Settings"
        description="Manage sender identity, deliverability, and workspace options."
        icon={Settings}
        bullets={["Sender & reply-to", "Deliverability", "Team access"]}
      />
    );
  }

  const [members, roles, activity] = await Promise.all([
    listMembers(),
    listRoles(),
    listMemberActivity({ limit: 100 }),
  ]);

  return (
    <TeamView
      members={members}
      roles={roles}
      activity={activity}
      capabilities={CAPABILITIES.map((c) => ({ key: c.key, label: c.label }))}
    />
  );
}
