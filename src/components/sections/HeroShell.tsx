/**
 * Server-rendered stand-in for the Sentinel Core: CSS gradients and inline SVG facets.
 * It is what reduced-motion and low-power visitors see, and it covers the canvas until the
 * scene reports its first frame. Pure decoration, hidden from assistive technology.
 */
const FACETS: ReadonlyArray<readonly [string, number]> = [
  ["200,40 300,110 200,170", 0.34],
  ["200,40 100,110 200,170", 0.2],
  ["100,110 200,170 120,250", 0.14],
  ["300,110 200,170 280,250", 0.26],
  ["120,250 200,170 280,250", 0.1],
  ["120,250 280,250 200,330", 0.18],
  ["100,110 120,250 60,190", 0.08],
  ["300,110 280,250 340,190", 0.12],
];

export function HeroShell() {
  return (
    <div
      data-hero-static
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      style={{
        background:
          "radial-gradient(60rem 40rem at 78% 30%, rgb(31 85 224 / 0.22), transparent 60%), radial-gradient(40rem 30rem at 10% 90%, rgb(142 197 255 / 0.08), transparent 70%)",
      }}
    >
      {/* Keeps the headline legible over the canvas: night on the copy side, clear on the core side. */}
      <div className="absolute inset-0 bg-gradient-to-b from-night/40 via-night/70 to-night lg:bg-gradient-to-r lg:from-night lg:via-night/75 lg:to-transparent lg:to-70%" />
      <svg
        data-hero-facets
        viewBox="0 0 400 370"
        className="absolute right-[-18%] top-[8%] w-[min(88vw,40rem)] opacity-80 sm:right-[-6%] lg:right-[6%] lg:top-[18%] lg:w-[30rem]"
      >
        <defs>
          <linearGradient id="facet-rim" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#8ec5ff" />
            <stop offset="1" stopColor="#1f55e0" />
          </linearGradient>
        </defs>
        {FACETS.map(([points, opacity]) => (
          <polygon key={points} points={points} fill="url(#facet-rim)" fillOpacity={opacity} stroke="#8ec5ff" strokeOpacity="0.45" strokeWidth="0.8" />
        ))}
      </svg>
    </div>
  );
}
