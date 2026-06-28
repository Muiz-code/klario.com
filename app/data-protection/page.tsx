import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal/LegalLayout";
import { DATA_PROTECTION } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Data Protection Policy | Klario Finance",
  description:
    "How Raavon Limited, the company behind Klario Finance, protects personal data under the Nigeria Data Protection Act 2023.",
  alternates: { canonical: "/data-protection" },
};

export default function DataProtectionPage() {
  return <LegalLayout page={DATA_PROTECTION} />;
}
