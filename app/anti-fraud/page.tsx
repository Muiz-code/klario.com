import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal/LegalLayout";
import { ANTI_FRAUD } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Anti-Fraud Policy | Klario Finance",
  description:
    "Raavon Limited's zero-tolerance approach to fraud, bribery and corruption across Klario Finance and all of its ventures.",
  alternates: { canonical: "/anti-fraud" },
};

export default function AntiFraudPage() {
  return <LegalLayout page={ANTI_FRAUD} />;
}
