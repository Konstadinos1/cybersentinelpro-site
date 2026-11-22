export const LOCALES = ["fr", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "fr";
export const LOCALE_COOKIE = "csp_locale";
export const LOCALE_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

/** Localised privacy slugs (SPEC §4). The route folder is `privacy`; French is rewritten. */
export const PRIVACY_PATHS: Record<Locale, string> = { fr: "/fr/confidentialite", en: "/en/privacy" };

export const HREFLANG: Record<Locale, string> = { fr: "fr-CA", en: "en-CA" };

export function isLocale(value: string | undefined | null): value is Locale {
  return value === "fr" || value === "en";
}

export function otherLocale(locale: Locale): Locale {
  return locale === "fr" ? "en" : "fr";
}

/** Maps the current path to its twin in the other language, privacy slug included. */
export function twinPath(pathname: string, target: Locale): string {
  const isPrivacy = pathname.endsWith("/confidentialite") || pathname.endsWith("/privacy");
  return isPrivacy ? PRIVACY_PATHS[target] : `/${target}`;
}

/** Picks a locale from an Accept-Language header, by quality weight. */
export function localeFromAcceptLanguage(header: string | null): Locale | null {
  if (!header) return null;
  const ranked = header
    .split(",")
    .map((part) => {
      const [tag = "", quality] = part.trim().split(";q=");
      return { language: tag.toLowerCase().slice(0, 2), weight: quality ? Number(quality) : 1 };
    })
    .filter((entry) => !Number.isNaN(entry.weight))
    .sort((a, b) => b.weight - a.weight);
  const match = ranked.find((entry) => isLocale(entry.language));
  return match && isLocale(match.language) ? match.language : null;
}
