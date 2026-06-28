import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal/LegalLayout";
import { DELETE_ACCOUNT } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Delete your Klario account | Klario Finance",
  description:
    "How to delete your Klario (Raavon Limited) account and associated data, what is deleted, and what is kept under applicable Nigerian law.",
  alternates: { canonical: "/delete-account" },
  robots: { index: true, follow: true },
};

export default function DeleteAccountPage() {
  return <LegalLayout page={DELETE_ACCOUNT} />;
}
