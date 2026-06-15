import { LayoutTemplate } from "lucide-react";
import { ComingSoon } from "../_components/ComingSoon";

export default function TemplatesPage() {
  return (
    <ComingSoon
      title="Templates"
      description="Save and reuse email layouts across campaigns."
      icon={LayoutTemplate}
      bullets={["Reusable blocks", "Brand presets", "Quick start layouts"]}
    />
  );
}
