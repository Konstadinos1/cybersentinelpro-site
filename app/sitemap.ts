import type { MetadataRoute } from "next";
import { HREFLANG, PRIVACY_PATHS } from "@/i18n/config";
import { siteConfig } from "@/lib/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.siteUrl;
  const home = { [HREFLANG.fr]: `${base}/fr`, [HREFLANG.en]: `${base}/en` };
  const privacy = { [HREFLANG.fr]: `${base}${PRIVACY_PATHS.fr}`, [HREFLANG.en]: `${base}${PRIVACY_PATHS.en}` };
  return [
    { url: `${base}/fr`, alternates: { languages: home }, priority: 1 },
    { url: `${base}/en`, alternates: { languages: home }, priority: 0.9 },
    { url: `${base}${PRIVACY_PATHS.fr}`, alternates: { languages: privacy }, priority: 0.3 },
    { url: `${base}${PRIVACY_PATHS.en}`, alternates: { languages: privacy }, priority: 0.3 },
  ];
}
