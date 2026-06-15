import { FileText } from "lucide-react";
import { ComingSoon } from "../_components/ComingSoon";

export default function ReportsPage() {
  return (
    <ComingSoon
      title="Reports"
      description="Export performance summaries and scheduled digests."
      icon={FileText}
      bullets={["CSV exports", "Scheduled digests", "Deliverability reports"]}
    />
  );
}
