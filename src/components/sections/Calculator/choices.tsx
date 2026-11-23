"use client";

import { useId } from "react";

/** Radio group rendered as large tappable rows. */
export function SingleChoice<T extends string>({
  name,
  options,
  value,
  onSelect,
}: {
  name: string;
  options: ReadonlyArray<readonly [T, string]>;
  value: T | undefined;
  onSelect: (value: T) => void;
}) {
  return (
    <div role="radiogroup" className="grid gap-2.5 sm:grid-cols-2">
      {options.map(([key, label]) => (
        <ChoiceRow key={key} type="radio" name={name} label={label} checked={value === key} onChange={() => onSelect(key)} value={key} />
      ))}
    </div>
  );
}

export function MultiChoice<T extends string>({
  name,
  options,
  values,
  onToggle,
}: {
  name: string;
  options: ReadonlyArray<readonly [T, string]>;
  values: readonly T[];
  onToggle: (value: T) => void;
}) {
  return (
    <div className="grid gap-2.5 sm:grid-cols-2">
      {options.map(([key, label]) => (
        <ChoiceRow key={key} type="checkbox" name={name} label={label} checked={values.includes(key)} onChange={() => onToggle(key)} value={key} />
      ))}
    </div>
  );
}

function ChoiceRow({
  type,
  name,
  value,
  label,
  checked,
  onChange,
}: {
  type: "radio" | "checkbox";
  name: string;
  value: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  const id = useId();
  return (
    <label
      htmlFor={id}
      data-choice={value}
      className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-md border px-4 py-3 transition-colors ${
        checked ? "border-ice bg-fleur/20" : "border-line-strong hover:border-ice/60"
      }`}
    >
      <input id={id} type={type} name={name} value={value} checked={checked} onChange={onChange} className="size-4 shrink-0 accent-[var(--color-fleur)]" />
      <span>{label}</span>
    </label>
  );
}

/** One yes/no question per control; neither answer is preselected. */
export function YesNoRow({
  name,
  label,
  value,
  yes,
  no,
  onChange,
}: {
  name: string;
  label: string;
  value: boolean | undefined;
  yes: string;
  no: string;
  onChange: (value: boolean) => void;
}) {
  const labelId = useId();
  return (
    <div role="radiogroup" aria-labelledby={labelId} className="flex flex-col gap-3 border-b border-line py-4 sm:flex-row sm:items-center sm:justify-between">
      <p id={labelId} className="max-w-md">
        {label}
      </p>
      <div className="flex shrink-0 gap-2">
        {([true, false] as const).map((answer) => (
          <label key={String(answer)} className={`flex min-h-11 min-w-20 cursor-pointer items-center justify-center gap-2 rounded-md border px-4 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ice ${value === answer ? "border-ice bg-fleur/20" : "border-line-strong"}`}>
            <input type="radio" name={name} data-control={name} data-answer={answer ? "yes" : "no"} checked={value === answer} onChange={() => onChange(answer)} className="sr-only" />
            {answer ? yes : no}
          </label>
        ))}
      </div>
    </div>
  );
}
