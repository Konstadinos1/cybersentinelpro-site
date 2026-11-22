import type { Dictionary } from "@/i18n/dictionaries/fr";
import { TrackedLink } from "./TrackedLink";

/**
 * Prove, close, keep. On desktop each tier gets a tall panel on the left while the scroll
 * engine moves the camera between the three monoliths on the right.
 */
export function OfferLadder({ copy }: { copy: Dictionary["offers"] }) {
  return (
    <section id="solutions" data-scene-section="monoliths" className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="text-[length:var(--text-section)] leading-[var(--text-section--line-height)] font-semibold">{copy.title}</h2>
          <p className="mt-4 text-mist">{copy.intro}</p>
        </div>
        <ol className="mt-14 space-y-6 lg:mt-20 lg:space-y-0">
          {copy.tiers.map((tier, index) => (
            <li key={tier.id} data-tier-panel={index} data-tier={tier.id} className="lg:flex lg:min-h-[78vh] lg:items-center">
              <article className="panel w-full max-w-xl rounded-lg p-6 transition-colors sm:p-8 lg:data-[active=true]:border-ice/60">
                <p className="hud-text text-ice">{tier.code}</p>
                <h3 className="mt-2 text-2xl font-semibold sm:text-3xl">{tier.name}</h3>
                <p className="mt-4 font-display text-3xl font-semibold tabular-nums">{tier.price}</p>
                <p className="mt-1 text-mist">{tier.cadence}</p>
                <p className="mt-6 text-sm font-semibold">{copy.includesLabel}</p>
                <ul className="mt-2 space-y-2">
                  {tier.includes.map((item) => (
                    <li key={item} className="grid grid-cols-[1rem_1fr] gap-2">
                      <svg aria-hidden="true" viewBox="0 0 16 16" className="mt-1.5 size-3 text-ice">
                        <path d="M8 1 15 8 8 15 1 8Z" fill="currentColor" />
                      </svg>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-5 text-sm text-mist">{tier.anchors}</p>
                <p className="mt-2 text-sm text-mist">{tier.outOfScope}</p>
                {tier.id === "tier1" ? (
                  <p data-disclaimer className="mt-4 border-l-2 border-amber/70 pl-3 text-sm">
                    {copy.disclaimer}
                  </p>
                ) : null}
                <TrackedLink href={tier.href} target={tier.href === "#sandbox" ? "sandbox" : "diagnostic"} className="btn-secondary mt-6">
                  {tier.cta}
                </TrackedLink>
              </article>
            </li>
          ))}
        </ol>
        <p className="mt-8 text-sm text-mist">{copy.pricesNote}</p>
      </div>
    </section>
  );
}
