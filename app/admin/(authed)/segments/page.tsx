import { Layers } from "lucide-react";
import { ComingSoon } from "../_components/ComingSoon";

export default function SegmentsPage() {
  return (
    <ComingSoon
      title="Segments"
      description="Group your audience by status, engagement, and attributes."
      icon={Layers}
      bullets={["Saved filters", "Dynamic segments", "Engagement tiers"]}
    />
  );
}
