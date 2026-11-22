import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { ConsentBanner } from "@/components/consent/ConsentBanner";
import { ConsentProvider } from "@/components/consent/ConsentProvider";
import { Footer } from "@/components/hud/Footer";
import { Header } from "@/components/hud/Header";
import { JsonLd } from "@/components/JsonLd";
import { fontVariables } from "@/fonts";
import { HREFLANG, isLocale, LOCALES, PRIVACY_PATHS, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { siteConfig } from "@/lib/site-config";

export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export const viewport: Viewport = { themeColor: "#07111f", colorScheme: "dark" };

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
  return {
    metadataBase: new URL(siteConfig.siteUrl),
    title: dict.meta.title,
    description: dict.meta.description,
    alternates: {
      canonical: `/${locale}`,
      languages: { [HREFLANG.fr]: "/fr", [HREFLANG.en]: "/en", "x-default": "/fr" },
    },
    openGraph: { title: dict.meta.title, description: dict.meta.description, locale: HREFLANG[locale].replace("-", "_"), type: "website", siteName: "CyberSentinelPro" },
    robots: { index: true, follow: true },
  };
}

export default async function LocaleLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;
  const dict = getDictionary(locale);
  return (
    <html lang={HREFLANG[locale]} className={fontVariables}>
      <body className="antialiased">
        <ConsentProvider>
          <Header locale={locale} copy={dict.hud} />
          {children}
          <Footer locale={locale} copy={dict.footer} />
          <ConsentBanner copy={dict.consent} privacyHref={PRIVACY_PATHS[locale]} />
        </ConsentProvider>
        <JsonLd locale={locale} dict={dict} />
      </body>
    </html>
  );
}
