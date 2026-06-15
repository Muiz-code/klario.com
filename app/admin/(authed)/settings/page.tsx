import { Settings } from "lucide-react";
import { ComingSoon } from "../_components/ComingSoon";

export default function SettingsPage() {
  return (
    <ComingSoon
      title="Settings"
      description="Manage sender identity, deliverability, and workspace options."
      icon={Settings}
      bullets={["Sender & reply-to", "Deliverability", "Team access"]}
    />
  );
}
