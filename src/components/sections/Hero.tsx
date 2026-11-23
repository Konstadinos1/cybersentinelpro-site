import type { Dictionary } from "@/i18n/dictionaries/fr";
import { TrustBar } from "../hud/TrustBar";
import { HeroShell } from "./HeroShell";
import { TrackedLink } from "./TrackedLink";

/** The headline is the LCP element; the canvas never is (webgl-performance rules). */
export function Hero({ copy }: { copy: Dictionary["hero"] }) {
  return (
    <section id="top" data-scene-section="core" className="relative isolate flex min-h-[100svh] items-center overflow-hidden pt-28 pb-16 lg:pt-32">
      <HeroShell />
      <div className="mx-auto w-full max-w-7xl px-5 lg:px-8">
        <div className="max-w-[44rem]">
          <h1 className="text-[length:var(--text-display)] leading-[var(--text-display--line-height)] font-semibold">
            {copy.title}
          </h1>
          <p className="mt-6 max-w-[36rem] text-lg text-mist">{copy.subtitle}</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <TrackedLink href="#diagnostic" target="diagnostic" className="btn-primary">
              {copy.primaryCta}
            </TrackedLink>
            <TrackedLink href="#sandbox" target="sandbox" className="btn-secondary">
              {copy.secondaryCta}
            </TrackedLink>
          </div>
          <div className="mt-12">
            <TrustBar items={copy.trust} label={copy.trustLabel} />
          </div>
        </div>
      </div>
    </section>
  );
}
