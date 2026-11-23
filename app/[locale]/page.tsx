import { notFound } from "next/navigation";
import { Calculator } from "@/components/sections/Calculator/Calculator";
import { Hero } from "@/components/sections/Hero";
import { MoatMatrix } from "@/components/sections/MoatMatrix";
import { OfferLadder } from "@/components/sections/OfferLadder";
import { PartnerTrack } from "@/components/sections/PartnerTrack";
import { Sandbox } from "@/components/sections/Sandbox/Sandbox";
import { isLocale, PRIVACY_PATHS } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { siteConfig } from "@/lib/site-config";
import { SceneLoader } from "@/scene/SceneLoader";

function SectionHeading({ title, intro }: { title: string; intro: string }) {
  return (
    <div className="max-w-2xl">
      <h2 className="text-[length:var(--text-section)] leading-[var(--text-section--line-height)] font-semibold">{title}</h2>
      <p className="mt-4 text-mist">{intro}</p>
    </div>
  );
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const privacyHref = PRIVACY_PATHS[locale];
  return (
    <>
      <SceneLoader />
      <main id="main" className="relative">
        <Hero copy={dict.hero} />
        <section id="diagnostic" className="relative z-10 bg-night py-24 lg:py-32">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 lg:grid-cols-[1fr_1.6fr] lg:px-8">
            <SectionHeading title={dict.calculator.title} intro={dict.calculator.intro} />
            <Calculator locale={locale} copy={dict.calculator} forms={dict.forms} privacyHref={privacyHref} calcomLink={siteConfig.calcomLink} deepAuditUrl={siteConfig.deepAuditUrl} />
          </div>
        </section>
        <section id="sandbox" data-scene-section="firewall" className="relative py-24 lg:py-32">
          <div className="mx-auto max-w-7xl space-y-10 px-5 lg:px-8">
            <SectionHeading title={dict.sandbox.title} intro={dict.sandbox.intro} />
            <Sandbox locale={locale} copy={dict.sandbox} />
          </div>
        </section>
        <OfferLadder copy={dict.offers} />
        <MoatMatrix copy={dict.moat} />
        <PartnerTrack locale={locale} copy={dict.partners} forms={dict.forms} privacyHref={privacyHref} />
      </main>
    </>
  );
}
