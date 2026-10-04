import { renderToBuffer } from "@react-pdf/renderer";
import { createElement } from "react";
import { InvestorBrief } from "@/lib/investors/briefPdf";

// /Klario-Investor-Brief.pdf: the investor brief, rendered on the server as a
// real A4 document from the same data as /investors. Built per request so it
// always matches the page; cached at the edge for an hour.
export const runtime = "nodejs";

export async function GET() {
  const pdf = await renderToBuffer(createElement(InvestorBrief));
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'inline; filename="Klario-Investor-Brief.pdf"',
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
