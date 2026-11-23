import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HREFLANG, isLocale, PRIVACY_PATHS } from "@/i18n/config";
import { getDictionary, interpolate } from "@/i18n/get-dictionary";
import { siteConfig } from "@/lib/site-config";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
  return {
    title: dict.meta.privacyTitle,
    description: dict.meta.privacyDescription,
    alternates: {
      canonical: PRIVACY_PATHS[locale],
      languages: { [HREFLANG.fr]: PRIVACY_PATHS.fr, [HREFLANG.en]: PRIVACY_PATHS.en, "x-default": PRIVACY_PATHS.fr },
    },
  };
}

/** Served at /fr/confidentialite (rewrite) and /en/privacy. */
export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const copy = getDictionary(locale).privacy;
  const email = siteConfig.privacyOfficerEmail;
  const officer = interpolate(copy.officerBody, { name: siteConfig.privacyOfficerName, email });
  return (
    <main id="main" className="relative z-10 mx-auto max-w-3xl px-5 pt-32 pb-24 lg:px-8">
      <h1 className="text-[length:var(--text-section)] leading-[var(--text-section--line-height)] font-semibold">{copy.title}</h1>
      <p className="mt-3 text-sm text-mist">{copy.updated}</p>
      <p className="mt-6 text-lg text-mist">{copy.intro}</p>
      <section className="mt-12" data-privacy-officer>
        <h2 className="text-2xl font-semibold">{copy.officerHeading}</h2>
        <p className="mt-3">
          {officer.split(email)[0]}
          <a href={`mailto:${email}`} className="text-ice underline underline-offset-2">{email}</a>
          {officer.split(email)[1]}
        </p>
      </section>
      {copy.sections.map((section) => (
        <section key={section.heading} className="mt-10">
          <h2 className="text-2xl font-semibold">{section.heading}</h2>
          <ul className="mt-3 space-y-2">
            {section.body.map((line) => (
              <li key={line} className="text-mist">{line}</li>
            ))}
          </ul>
        </section>
      ))}
      <section className="mt-10">
        <h2 className="text-2xl font-semibold">{copy.analyticsHeading}</h2>
        <p className="mt-3 text-mist">{copy.analytics[siteConfig.analyticsProvider]}</p>
      </section>
      <Link href={`/${locale}`} className="btn-secondary mt-12">{copy.back}</Link>
    </main>
  );
}
