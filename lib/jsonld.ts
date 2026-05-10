import { SITE, PRICING, HOW_IT_WORKS, FAQS, SOLUTION } from "./constants";

const orgId = `${SITE.url}/#organization`;
const siteId = `${SITE.url}/#website`;
const appId = `${SITE.url}/#app`;
const faqId = `${SITE.url}/#faq`;
const howToId = `${SITE.url}/#howto`;

export const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": orgId,
      name: SITE.legalName,
      alternateName: SITE.name,
      url: SITE.url,
      logo: {
        "@type": "ImageObject",
        url: `${SITE.url}/opengraph-image`,
        width: 1200,
        height: 630,
      },
      description:
        "AI-powered personal finance management app for Nigerians. Connect every bank, track every naira, automate savings, and pay bills in one place.",
      foundingDate: "2025",
      areaServed: { "@type": "Country", name: "Nigeria" },
      parentOrganization: {
        "@type": "Organization",
        name: SITE.poweredBy.brand,
        url: SITE.poweredBy.url,
      },
      sameAs: [],
    },
    {
      "@type": "WebSite",
      "@id": siteId,
      url: SITE.url,
      name: SITE.name,
      description: SITE.tagline,
      publisher: { "@id": orgId },
      inLanguage: "en-NG",
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE.url}/?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "SoftwareApplication",
      "@id": appId,
      name: SITE.name,
      alternateName: SITE.legalName,
      operatingSystem: "iOS, Android",
      applicationCategory: "FinanceApplication",
      applicationSubCategory: "Personal Finance Management",
      description: SITE.tagline,
      url: SITE.url,
      screenshot: `${SITE.url}/opengraph-image`,
      inLanguage: "en-NG",
      countriesSupported: "NG",
      featureList: SOLUTION.tabs.map((t) => `${t.eyebrow}: ${t.title}`),
      offers: PRICING.tiers.map((t) => ({
        "@type": "Offer",
        name: t.name,
        price: t.monthly,
        priceCurrency: "NGN",
        category: t.monthly === 0 ? "Free" : "Subscription",
        availability: "https://schema.org/PreOrder",
      })),
      publisher: { "@id": orgId },
    },
    {
      "@type": "FAQPage",
      "@id": faqId,
      mainEntity: FAQS.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: f.a,
        },
      })),
    },
    {
      "@type": "HowTo",
      "@id": howToId,
      name: "How to set up Klario for Nigerian personal finance management",
      description:
        "Three steps to consolidate every Nigerian bank account, track every naira, and start automating savings.",
      totalTime: "PT5M",
      step: HOW_IT_WORKS.steps.map((s, i) => ({
        "@type": "HowToStep",
        position: i + 1,
        name: s.title,
        text: s.body,
        url: `${SITE.url}/#how-it-works`,
      })),
    },
  ],
};

export function legalBreadcrumbJsonLd(slug: string, title: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE.url,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: title,
        item: `${SITE.url}/${slug}`,
      },
    ],
  };
}
