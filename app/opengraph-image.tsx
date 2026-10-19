import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { SITE } from "@/lib/constants";

export const alt = `${SITE.name}: ${SITE.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/jpeg";

/**
 * The share card is the landing hero itself (Caro1, the verbs, the scan card
 * and trust row), captured from the page at 1200x630 into app/assets/og.
 * Served through this route rather than as app/opengraph-image.jpg so the
 * "/opengraph-image" URL that metadata, JSON-LD and the beta / Anchor Club
 * pages point at stays the same.
 *
 * To refresh it after the hero changes, screenshot the hero at a 1200x630
 * viewport (2x, scaled to CSS pixels) with the first slide showing and the
 * route loader gone, and overwrite hero.jpg.
 */
export default async function OpengraphImage() {
  return new Response(await readFile(join(process.cwd(), "app/assets/og/hero.jpg")), {
    headers: { "Content-Type": contentType },
  });
}
