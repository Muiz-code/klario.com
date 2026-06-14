import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal/LegalLayout";
import { PRIVACY } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Privacy Policy | Klario Finance",
  description:
    "How Klario Finance collects, stores, and protects your personal and financial data.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return <LegalLayout page={PRIVACY} />;
}
