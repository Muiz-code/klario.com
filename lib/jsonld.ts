import { SITE, PRICING } from "./constants";

export const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE.url}/#organization`,
      name: SITE.name,
      url: SITE.url,
      logo: `${SITE.url}/opengraph-image`,
      description:
        "AI-powered personal finance management app for Nigerians. Connect every bank, track every naira, automate savings, and pay bills in one place.",
      foundingDate: "2025",
      areaServed: { "@type": "Country", name: "Nigeria" },
      sameAs: [],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE.url}/#website`,
      url: SITE.url,
      name: SITE.name,
      description: SITE.tagline,
      publisher: { "@id": `${SITE.url}/#organization` },
      inLanguage: "en-NG",
    },
    {
      "@type": "MobileApplication",
      "@id": `${SITE.url}/#app`,
      name: SITE.name,
      operatingSystem: "iOS, Android",
      applicationCategory: "FinanceApplication",
      description: SITE.tagline,
      offers: PRICING.tiers.map((t) => ({
        "@type": "Offer",
        name: t.name,
        price: t.monthly,
        priceCurrency: "NGN",
        category: t.monthly === 0 ? "Free" : "Subscription",
      })),
      publisher: { "@id": `${SITE.url}/#organization` },
    },
  ],
};
