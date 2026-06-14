import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal/LegalLayout";
import { TERMS } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Terms of Service | Klario Finance",
  description:
    "The agreement between you and Klario Finance for using the Klario app and platform.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return <LegalLayout page={TERMS} />;
}
