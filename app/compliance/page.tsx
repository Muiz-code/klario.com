import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal/LegalLayout";
import { COMPLIANCE } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Compliance | Klario Finance",
  description:
    "Klario Finance compliance: NDPA 2023, SCUML/EFCC registration, data protection, information security and anti-fraud controls.",
  alternates: { canonical: "/compliance" },
};

export default function CompliancePage() {
  return <LegalLayout page={COMPLIANCE} />;
}
