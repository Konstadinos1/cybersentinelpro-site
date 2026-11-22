export function TrustBar({ items, label }: { items: readonly string[]; label: string }) {
  return (
    <ul aria-label={label} className="hud-text flex flex-wrap items-center gap-x-3 gap-y-2 text-mist">
      {items.map((item, index) => (
        <li key={item} className="flex items-center gap-3">
          {index > 0 ? <span aria-hidden="true" className="text-line-strong">|</span> : null}
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
