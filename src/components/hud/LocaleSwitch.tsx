"use client";

import { usePathname, useRouter } from "next/navigation";
import { LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE_SECONDS, LOCALES, twinPath, type Locale } from "@/i18n/config";
import { trackEvent } from "@/lib/track-event";

/** `FR | EN`: maps the path to its twin, keeps the hash, sets the cookie, no full reload. */
export function LocaleSwitch({ locale, label }: { locale: Locale; label: string }) {
  const router = useRouter();
  const pathname = usePathname();

  function switchTo(target: Locale) {
    if (target === locale) return;
    document.cookie = `${LOCALE_COOKIE}=${target}; Max-Age=${LOCALE_COOKIE_MAX_AGE_SECONDS}; Path=/; SameSite=Lax`;
    trackEvent("locale_switch", { to: target });
    router.push(`${twinPath(pathname, target)}${window.location.hash}`, { scroll: false });
  }

  return (
    <div role="group" aria-label={label} className="hud-text flex items-center gap-1">
      {LOCALES.map((code, index) => (
        <span key={code} className="flex items-center gap-1">
          {index > 0 ? <span aria-hidden="true" className="text-mist/60">|</span> : null}
          <button
            type="button"
            lang={code}
            data-locale-switch={code}
            aria-pressed={code === locale}
            onClick={() => switchTo(code)}
            className={`min-h-8 px-1.5 ${code === locale ? "text-frost" : "text-mist hover:text-frost"}`}
          >
            {code.toUpperCase()}
          </button>
        </span>
      ))}
    </div>
  );
}
