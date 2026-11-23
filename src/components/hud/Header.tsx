"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/fr";
import { trackEvent } from "@/lib/track-event";
import { AudioToggle } from "./AudioToggle";
import { CipherText } from "./CipherText";
import { LocaleSwitch } from "./LocaleSwitch";

const NAV_ANCHORS = ["solutions", "sandbox", "diagnostic", "partners"] as const;

function Wordmark({ locale, label }: { locale: Locale; label: string }) {
  return (
    <Link
      href={`/${locale}`}
      aria-label={label}
      className="flex items-center gap-2.5 font-display text-lg font-semibold tracking-tight"
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="size-6 text-ice">
        <path
          d="M12 2 21 7.2v9.6L12 22 3 16.8V7.2Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
        />
        <path
          d="M12 2v20M3 7.2l18 9.6M21 7.2 3 16.8"
          stroke="currentColor"
          strokeWidth="0.8"
          opacity="0.55"
        />
      </svg>
      <span>
        Cyber<span className="text-ice">Sentinel</span>Pro
      </span>
    </Link>
  );
}

export function Header({ locale, copy }: { locale: Locale; copy: Dictionary["hud"] }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuId = useId();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = NAV_ANCHORS.map((anchor) => ({
    anchor,
    href: `/${locale}#${anchor}`,
    label: copy.nav[anchor],
  }));
  const cta = (
    <a
      href={`/${locale}#diagnostic`}
      className="btn-primary min-h-10 px-4 py-2 text-sm"
      onClick={() => trackEvent("cta_click", { target: "diagnostic" })}
    >
      {copy.cta}
    </a>
  );

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 border-b transition-colors ${scrolled || menuOpen ? "border-line bg-night/90 backdrop-blur-md" : "border-transparent"}`}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:bg-fleur focus:px-3 focus:py-2"
      >
        {copy.skip}
      </a>
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-5 lg:px-8">
        <Wordmark locale={locale} label={copy.home} />
        <nav
          aria-label="Navigation"
          className="hidden flex-1 justify-center gap-6 text-sm text-mist lg:flex"
        >
          {links.map((link) => (
            <a key={link.anchor} href={link.href} className="hover:text-frost">
              {link.label}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-3 lg:ml-0">
          <LocaleSwitch locale={locale} label={copy.localeLabel} />
          <div className="hidden items-center gap-4 lg:flex">
            <AudioToggle onLabel={copy.audioOn} offLabel={copy.audioOff} label={copy.audioLabel} />
            {cta}
          </div>
          <button
            type="button"
            className="btn-secondary min-h-10 whitespace-nowrap px-3 py-2 text-sm lg:hidden"
            aria-expanded={menuOpen}
            aria-controls={menuId}
            // The full phrase does not fit the 390 px header; screen readers still hear it.
            aria-label={menuOpen ? copy.closeMenu : undefined}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? copy.close : copy.menu}
          </button>
        </div>
      </div>
      <div className="hidden border-t border-line/60 lg:block">
        <p aria-hidden="true" className="mx-auto max-w-7xl px-8 py-1 text-[0.68rem] text-mist/80">
          <CipherText text={copy.telemetry} className="hud-text text-[0.68rem]" />
        </p>
      </div>
      <div id={menuId} hidden={!menuOpen} className="border-t border-line px-5 pb-5 lg:hidden">
        <nav aria-label="Navigation" className="flex flex-col py-2">
          {links.map((link) => (
            <a
              key={link.anchor}
              href={link.href}
              className="py-3 text-base"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center justify-between gap-4">
          <AudioToggle onLabel={copy.audioOn} offLabel={copy.audioOff} label={copy.audioLabel} />
          {cta}
        </div>
        <p aria-hidden="true" className="hud-text mt-4 text-mist/70">
          {copy.telemetry}
        </p>
      </div>
    </header>
  );
}
