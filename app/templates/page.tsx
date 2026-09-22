import type { Metadata } from "next";
import { promises as fs } from "fs";
import path from "path";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { TemplatesLanding, type TemplateEntry } from "@/components/templates/TemplatesLanding";

/**
 * klario.finance/templates
 *
 * The budget templates a business downloads, fills in Excel and uploads back
 * to Klario. One catalogue, two modes per business type: Fast (one page,
 * pictures, three columns, for people who find spreadsheets hard) and
 * Advanced (setup, budget, actuals, variance). The files live in
 * /public/templates and the catalogue there is the single source of truth,
 * shared with the app.
 */
export const metadata: Metadata = {
  title: "Business budget templates | Klario",
  description:
    "Free Excel budget templates for Nigerian businesses: a fast one-page budget and a full monthly budget with actuals and variance, for eleven business types.",
  alternates: { canonical: "/templates" },
};

async function loadCatalogue(): Promise<TemplateEntry[]> {
  try {
    const raw = await fs.readFile(path.join(process.cwd(), "public", "templates", "catalogue.json"), "utf8");
    const rows = JSON.parse(raw) as TemplateEntry[];
    return Array.isArray(rows) ? rows : [];
  } catch {
    return [];
  }
}

export default async function TemplatesPage() {
  const catalogue = await loadCatalogue();
  return (
    <>
      <Navbar theme="light" />
      <TemplatesLanding catalogue={catalogue} />
      <Footer />
    </>
  );
}
