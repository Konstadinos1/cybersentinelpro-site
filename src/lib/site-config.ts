/** Public configuration read from NEXT_PUBLIC_* variables at build time. */

const DEFAULT_SITE_URL = "https://cybersentinelpro.com";
/** Published on the privacy page as the privacy officer's mailbox (SPEC §12). */
const DEFAULT_PRIVACY_OFFICER_EMAIL = "confidentialite@cybersentinelpro.com";

export type AnalyticsProvider = "none" | "vercel" | "plausible";

function readAnalyticsProvider(value: string | undefined): AnalyticsProvider {
  return value === "vercel" || value === "plausible" ? value : "none";
}

function optional(value: string | undefined): string | null {
  return value && value.trim() !== "" ? value.trim() : null;
}

export const siteConfig = {
  siteUrl: (optional(process.env.NEXT_PUBLIC_SITE_URL) ?? DEFAULT_SITE_URL).replace(/\/$/, ""),
  deepAuditUrl: optional(process.env.NEXT_PUBLIC_DEEP_AUDIT_URL),
  calcomLink: optional(process.env.NEXT_PUBLIC_CALCOM_LINK),
  analyticsProvider: readAnalyticsProvider(process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER),
  privacyOfficerEmail: optional(process.env.NEXT_PUBLIC_PRIVACY_OFFICER_EMAIL) ?? DEFAULT_PRIVACY_OFFICER_EMAIL,
  privacyOfficerName: "Konstadinos Aivaliotis",
  locality: "Laval",
  region: "QC",
  country: "CA",
} as const;

/** Third-party hosts, listed once so the CSP and the consent gate stay in sync. */
export const ANALYTICS_SCRIPT_SRC: Record<Exclude<AnalyticsProvider, "none">, string> = {
  plausible: "https://plausible.io/js/script.js",
  vercel: "/_vercel/insights/script.js",
};

export const CALCOM_ORIGIN = "https://cal.com";
