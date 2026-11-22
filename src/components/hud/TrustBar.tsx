/**
 * Each item carries its own leading separator. The list is shifted left by one separator
 * width inside a clipping wrapper, so whichever item starts a line hides its separator and a
 * wrapped line never begins with "|".
 */
export function TrustBar({ items, label }: { items: readonly string[]; label: string }) {
  return (
    <div className="overflow-hidden">
      <ul
        aria-label={label}
        className="hud-text -ml-6 flex flex-wrap items-center gap-y-2 text-mist"
      >
        {items.map((item) => (
          <li key={item} className="flex items-center">
            <span aria-hidden="true" className="w-6 shrink-0 text-center text-line-strong">
              |
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
