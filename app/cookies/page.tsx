import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal/LegalLayout";
import { COOKIES } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Cookie Policy — Klario Finance",
  description:
    "How Klario Finance uses cookies and how you can manage them in your browser.",
  alternates: { canonical: "/cookies" },
};

export default function CookiesPage() {
  return <LegalLayout page={COOKIES} />;
}
