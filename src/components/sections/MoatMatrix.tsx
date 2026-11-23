import type { Dictionary } from "@/i18n/dictionaries/fr";

/** Category comparison only: no competitor is named (SPEC §5). */
export function MoatMatrix({ copy }: { copy: Dictionary["moat"] }) {
  const [ours, ...others] = copy.columns;
  return (
    <section id="moat" className="relative z-10 bg-night py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="text-[length:var(--text-section)] leading-[var(--text-section--line-height)] font-semibold">{copy.title}</h2>
          <p className="mt-4 text-mist">{copy.intro}</p>
        </div>
        <div className="mt-12 overflow-x-auto rounded-lg border border-line" tabIndex={0} role="region" aria-label={copy.title}>
          <table className="w-full min-w-[52rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-line">
                <th scope="col" className="w-48 p-4 font-normal text-mist">{copy.criterionLabel}</th>
                <th scope="col" className="bg-fleur/15 p-4 font-display text-base font-semibold text-frost">{ours}</th>
                {others.map((column) => (
                  <th key={column} scope="col" className="p-4 font-semibold text-mist">{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {copy.rows.map((row) => {
                const [ourValue, ...otherValues] = row.values;
                return (
                  <tr key={row.label} className="border-b border-line last:border-b-0">
                    <th scope="row" className="p-4 font-semibold">{row.label}</th>
                    <td className="bg-fleur/15 p-4 text-frost">{ourValue}</td>
                    {otherValues.map((value, index) => (
                      <td key={`${row.label}-${index}`} className="p-4 text-mist">{value}</td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
