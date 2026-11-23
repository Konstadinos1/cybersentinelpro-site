import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/fr";
import { siteConfig } from "@/lib/site-config";

const OFFER_PRICES: Record<string, { min: number; max: number; unit?: string }> = {
  tier1: { min: 5000, max: 10000 },
  tier2: { min: 5000, max: 15000 },
  tier3: { min: 2000, max: 5000, unit: "MON" },
};

/** ProfessionalService schema. No credential fields, by policy. */
export function JsonLd({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "CyberSentinelPro",
    url: `${siteConfig.siteUrl}/${locale}`,
    description: dict.meta.description,
    areaServed: [{ "@type": "City", name: "Laval" }, { "@type": "AdministrativeArea", name: "Greater Montreal" }],
    address: { "@type": "PostalAddress", addressLocality: siteConfig.locality, addressRegion: siteConfig.region, addressCountry: siteConfig.country },
    knowsLanguage: ["fr", "en"],
    email: siteConfig.privacyOfficerEmail,
    makesOffer: dict.offers.tiers.map((tier) => {
      const price = OFFER_PRICES[tier.id];
      return {
        "@type": "Offer",
        name: tier.name,
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          priceCurrency: "CAD",
          minPrice: price?.min,
          maxPrice: price?.max,
          ...(price?.unit ? { unitCode: price.unit } : {}),
        },
      };
    }),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
