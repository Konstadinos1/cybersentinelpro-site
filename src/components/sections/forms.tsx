"use client";

import Link from "next/link";
import { useId } from "react";
import type { Dictionary } from "@/i18n/dictionaries/fr";

export interface ContactValues {
  full_name: string;
  work_email: string;
  company: string;
  consent_contact: boolean;
  consent_marketing: boolean;
  website: string;
}

export const EMPTY_CONTACT: ContactValues = {
  full_name: "",
  work_email: "",
  company: "",
  consent_contact: false,
  consent_marketing: false,
  website: "",
};

export type FieldErrors = Partial<Record<string, string>>;
type FormsCopy = Dictionary["forms"];
type ErrorKey = keyof FormsCopy["errors"];

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;
const UTM_VALUE_MAX = 200;

export function readUtm(): Record<string, string> {
  const params = new URLSearchParams(window.location.search);
  return Object.fromEntries(
    UTM_KEYS.flatMap((key) => {
      const value = params.get(key);
      return value ? [[key, value.slice(0, UTM_VALUE_MAX)]] : [];
    }),
  );
}

export interface LeadResponse {
  status: number;
  body: { ok?: boolean; id?: string; score?: number; exposure_tier?: string; recommended_tier?: string; issues?: { field: string }[] };
}

/** Network failures are reported as status 0 so callers show the retry state. */
export async function submitLead(payload: Record<string, unknown>): Promise<LeadResponse> {
  try {
    const response = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = (await response.json().catch(() => ({}))) as LeadResponse["body"];
    return { status: response.status, body };
  } catch {
    return { status: 0, body: {} };
  }
}

/** Maps server validation issues to the localized inline message of each field. */
export function issuesToFieldErrors(issues: { field: string }[] | undefined, copy: FormsCopy): FieldErrors {
  const errors: FieldErrors = {};
  for (const { field } of issues ?? []) {
    const key = field.split(".")[0] as ErrorKey;
    errors[key] = copy.errors[key] ?? copy.errors.generic;
  }
  return errors;
}

function TextField(props: {
  name: keyof Pick<ContactValues, "full_name" | "work_email" | "company">;
  label: string;
  value: string;
  type?: string;
  autoComplete: string;
  error?: string;
  requiredMark: string;
  onChange: (value: string) => void;
}) {
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium">
        {props.label} <span className="text-mist">({props.requiredMark})</span>
      </label>
      <input
        id={id}
        name={props.name}
        type={props.type ?? "text"}
        autoComplete={props.autoComplete}
        className="field"
        value={props.value}
        aria-invalid={props.error ? true : undefined}
        aria-describedby={props.error ? errorId : undefined}
        onChange={(event) => props.onChange(event.target.value)}
      />
      {props.error ? (
        <p id={errorId} data-field-error={props.name} className="text-sm text-breach">
          {props.error}
        </p>
      ) : null}
    </div>
  );
}

export function ContactFields({
  values,
  errors,
  copy,
  onChange,
}: {
  values: ContactValues;
  errors: FieldErrors;
  copy: FormsCopy;
  onChange: (patch: Partial<ContactValues>) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <TextField name="full_name" label={copy.fullName} value={values.full_name} autoComplete="name" error={errors.full_name} requiredMark={copy.requiredMark} onChange={(v) => onChange({ full_name: v })} />
      <TextField name="company" label={copy.company} value={values.company} autoComplete="organization" error={errors.company} requiredMark={copy.requiredMark} onChange={(v) => onChange({ company: v })} />
      <div className="sm:col-span-2">
        <TextField name="work_email" label={copy.workEmail} type="email" value={values.work_email} autoComplete="email" error={errors.work_email} requiredMark={copy.requiredMark} onChange={(v) => onChange({ work_email: v })} />
      </div>
      {/* Honeypot: off-screen, skipped by keyboard and screen readers. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Website
          <input tabIndex={-1} autoComplete="off" name="website" value={values.website} onChange={(e) => onChange({ website: e.target.value })} />
        </label>
      </div>
    </div>
  );
}

export function ConsentFields({
  values,
  errors,
  copy,
  privacyHref,
  onChange,
}: {
  values: ContactValues;
  errors: FieldErrors;
  copy: FormsCopy;
  privacyHref: string;
  onChange: (patch: Partial<ContactValues>) => void;
}) {
  const contactId = useId();
  const marketingId = useId();
  return (
    <div className="space-y-3 text-sm">
      <div>
        <label htmlFor={contactId} className="flex items-start gap-3">
          <input id={contactId} name="consent_contact" type="checkbox" className="mt-1 size-4 shrink-0 accent-[var(--color-fleur)]" checked={values.consent_contact} aria-invalid={errors.consent_contact ? true : undefined} onChange={(e) => onChange({ consent_contact: e.target.checked })} />
          <span>
            {copy.consentContact} <span className="text-mist">({copy.requiredMark})</span>
          </span>
        </label>
        {errors.consent_contact ? (
          <p data-field-error="consent_contact" className="mt-1 pl-7 text-breach">
            {errors.consent_contact}
          </p>
        ) : null}
      </div>
      <label htmlFor={marketingId} className="flex items-start gap-3">
        <input id={marketingId} name="consent_marketing" type="checkbox" className="mt-1 size-4 shrink-0 accent-[var(--color-fleur)]" checked={values.consent_marketing} onChange={(e) => onChange({ consent_marketing: e.target.checked })} />
        <span>{copy.consentMarketing}</span>
      </label>
      <p className="text-mist">
        {copy.purpose}{" "}
        <Link href={privacyHref} className="text-ice underline underline-offset-2">
          {copy.privacyLink}
        </Link>
      </p>
    </div>
  );
}
