import Link from "next/link";
import { PRIVACY_PATHS, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/fr";
import { siteConfig } from "@/lib/site-config";
import { ConsentSettingsButton } from "../consent/ConsentBanner";

export function Footer({ locale, copy }: { locale: Locale; copy: Dictionary["footer"] }) {
  return (
    <footer className="relative z-10 border-t border-line bg-night">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 text-sm text-mist lg:grid-cols-[2fr_1fr_1fr] lg:px-8">
        <div className="max-w-xl space-y-3">
          <p className="font-display text-base font-semibold text-frost">CyberSentinelPro</p>
          <p data-disclaimer>{copy.disclaimer}</p>
          <p>{copy.address}</p>
        </div>
        <div className="space-y-2">
          <p className="text-frost">{copy.privacyOfficer}</p>
          <p>{siteConfig.privacyOfficerName}</p>
          <a href={`mailto:${siteConfig.privacyOfficerEmail}`} className="break-all text-ice underline underline-offset-2">
            {siteConfig.privacyOfficerEmail}
          </a>
        </div>
        <div className="flex flex-col items-start gap-2">
          <Link href={PRIVACY_PATHS[locale]} className="text-mist underline underline-offset-2 hover:text-frost">
            {copy.privacy}
          </Link>
          <ConsentSettingsButton label={copy.consentSettings} />
          <p className="mt-auto pt-4">{copy.rights}</p>
        </div>
      </div>
    </footer>
  );
}
