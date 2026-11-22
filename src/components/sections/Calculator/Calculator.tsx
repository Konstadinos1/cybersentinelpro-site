"use client";

import { useState, type FormEvent } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/fr";
import { interpolate } from "@/i18n/interpolate";
import { playGlassClick } from "@/lib/audio";
import {
  AI_STACK_ITEMS,
  assessReadiness,
  CONTROL_KEYS,
  HEADCOUNT_BANDS,
  VERTICALS,
  type AiStackItem,
  type ControlKey,
  type HeadcountBand,
  type ReadinessAnswers,
  type ReadinessAssessment,
  type Vertical,
} from "@/lib/scoring";
import { trackEvent } from "@/lib/track-event";
import { ConsentFields, ContactFields, EMPTY_CONTACT, issuesToFieldErrors, readUtm, submitLead, type ContactValues, type FieldErrors } from "../forms";
import { MultiChoice, SingleChoice, YesNoRow } from "./choices";
import { ResultView } from "./ResultView";

const TOTAL_STEPS = 5;
const CONTACT_STEP = 4;
const HTTP_CREATED = 201;
const HTTP_BAD_REQUEST = 400;
const HTTP_TOO_MANY = 429;

interface DraftAnswers {
  headcount_band?: HeadcountBand;
  vertical?: Vertical;
  ai_stack: AiStackItem[];
  controls: Partial<Record<ControlKey, boolean>>;
}

export interface CalculatorProps {
  locale: Locale;
  copy: Dictionary["calculator"];
  forms: Dictionary["forms"];
  privacyHref: string;
  calcomLink: string | null;
  deepAuditUrl: string | null;
}

function isStepComplete(step: number, draft: DraftAnswers): boolean {
  if (step === 0) return Boolean(draft.headcount_band);
  if (step === 1) return Boolean(draft.vertical);
  if (step === 2) return draft.ai_stack.length > 0;
  if (step === 3) return CONTROL_KEYS.every((key) => draft.controls[key] !== undefined);
  return true;
}

function toAnswers(draft: DraftAnswers): ReadinessAnswers | null {
  if (!draft.headcount_band || !draft.vertical || !isStepComplete(3, draft)) return null;
  const controls = Object.fromEntries(CONTROL_KEYS.map((key) => [key, draft.controls[key] === true])) as Record<ControlKey, boolean>;
  return { headcount_band: draft.headcount_band, vertical: draft.vertical, ai_stack: draft.ai_stack, controls };
}

export function Calculator(props: CalculatorProps) {
  const { copy, forms } = props;
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<DraftAnswers>({ ai_stack: [], controls: {} });
  const [contact, setContact] = useState<ContactValues>(EMPTY_CONTACT);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [stepError, setStepError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ assessment: ReadinessAssessment; saved: boolean } | null>(null);

  function goTo(next: number) {
    setStepError(false);
    setStep(next);
    trackEvent("calculator_step", { step: next + 1 });
  }

  function advance() {
    if (!isStepComplete(step, draft)) return setStepError(true);
    goTo(step + 1);
  }

  function toggleStack(item: AiStackItem) {
    setDraft((current) => ({
      ...current,
      ai_stack: current.ai_stack.includes(item) ? current.ai_stack.filter((value) => value !== item) : [...current.ai_stack, item],
    }));
  }

  async function submit(event?: FormEvent) {
    event?.preventDefault();
    const answers = toAnswers(draft);
    if (!answers || submitting) return;
    setSubmitting(true);
    const response = await submitLead({ source: "calculator", locale: props.locale, ...contact, ...answers, utm: readUtm() });
    setSubmitting(false);
    trackEvent("lead_submit", { source: "calculator", status: response.status });
    handleResponse(response.status, response.body, answers);
  }

  function handleResponse(status: number, body: Awaited<ReturnType<typeof submitLead>>["body"], answers: ReadinessAnswers) {
    if (status === HTTP_BAD_REQUEST) return setErrors(issuesToFieldErrors(body.issues, forms));
    if (status === HTTP_TOO_MANY) return setErrors({ form: forms.errors.rate_limited });
    // The server's score is authoritative; on failure the shared module gives the same number locally.
    const assessment = status === HTTP_CREATED && typeof body.score === "number" ? { ...assessReadiness(answers), score: body.score } : assessReadiness(answers);
    setErrors({});
    setResult({ assessment, saved: status === HTTP_CREATED });
    playGlassClick();
    trackEvent("calculator_complete", { score: assessment.score, exposure_tier: assessment.exposure_tier });
  }

  function restart() {
    setResult(null);
    setDraft({ ai_stack: [], controls: {} });
    setContact(EMPTY_CONTACT);
    goTo(0);
  }

  if (result) {
    return <ResultView {...props} assessment={result.assessment} saved={result.saved} submitting={submitting} onRetry={() => void submit()} onRestart={restart} />;
  }

  return (
    <form noValidate onSubmit={(event) => (step === CONTACT_STEP ? void submit(event) : (event.preventDefault(), advance()))} data-step={step + 1} className="panel rounded-lg p-5 sm:p-8">
      <div className="flex items-center justify-between gap-4">
        <p className="hud-text text-mist" aria-live="polite">
          {interpolate(copy.stepLabel, { current: step + 1, total: TOTAL_STEPS })}
        </p>
        <ol aria-hidden="true" className="flex gap-1.5">
          {Array.from({ length: TOTAL_STEPS }, (_, index) => (
            <li key={index} className={`h-1 w-7 rounded-full ${index <= step ? "bg-ice" : "bg-line-strong"}`} />
          ))}
        </ol>
      </div>
      <StepBody step={step} draft={draft} setDraft={setDraft} toggleStack={toggleStack} copy={copy} />
      {step === CONTACT_STEP ? (
        <div className="mt-6 space-y-5">
          <ContactFields values={contact} errors={errors} copy={forms} onChange={(patch) => setContact((c) => ({ ...c, ...patch }))} />
          <ConsentFields values={contact} errors={errors} copy={forms} privacyHref={props.privacyHref} onChange={(patch) => setContact((c) => ({ ...c, ...patch }))} />
        </div>
      ) : null}
      {stepError ? <p role="alert" className="mt-4 text-sm text-breach">{copy.selectRequired}</p> : null}
      {errors.form ? <p role="alert" className="mt-4 text-sm text-breach">{errors.form}</p> : null}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        {step > 0 ? (
          <button type="button" className="btn-secondary" onClick={() => goTo(step - 1)}>
            {copy.back}
          </button>
        ) : <span />}
        <button type="submit" className="btn-primary min-w-40" disabled={submitting} data-calculator-next>
          {step === CONTACT_STEP ? (submitting ? copy.submitting : copy.submit) : copy.next}
        </button>
      </div>
    </form>
  );
}

function StepBody({
  step,
  draft,
  setDraft,
  toggleStack,
  copy,
}: {
  step: number;
  draft: DraftAnswers;
  setDraft: (update: (current: DraftAnswers) => DraftAnswers) => void;
  toggleStack: (item: AiStackItem) => void;
  copy: Dictionary["calculator"];
}) {
  const titles = [copy.headcount.title, copy.vertical.title, copy.aiStack.title, copy.controls.title, copy.contact.title];
  return (
    <fieldset className="mt-6">
      <legend data-step-title className="font-display text-2xl font-semibold sm:text-3xl">
        {titles[step]}
      </legend>
      {step === 2 ? <p className="mt-2 text-sm text-mist">{copy.aiStack.hint}</p> : null}
      <div className="mt-5">
        {step === 0 ? <SingleChoice name="headcount_band" options={HEADCOUNT_BANDS.map((key) => [key, copy.headcount.options[key]] as const)} value={draft.headcount_band} onSelect={(value) => setDraft((d) => ({ ...d, headcount_band: value }))} /> : null}
        {step === 1 ? <SingleChoice name="vertical" options={VERTICALS.map((key) => [key, copy.vertical.options[key]] as const)} value={draft.vertical} onSelect={(value) => setDraft((d) => ({ ...d, vertical: value }))} /> : null}
        {step === 2 ? <MultiChoice name="ai_stack" options={AI_STACK_ITEMS.map((key) => [key, copy.aiStack.options[key]] as const)} values={draft.ai_stack} onToggle={toggleStack} /> : null}
        {step === 3
          ? CONTROL_KEYS.map((key) => (
              <YesNoRow key={key} name={key} label={copy.controls.items[key]} value={draft.controls[key]} yes={copy.controls.yes} no={copy.controls.no} onChange={(value) => setDraft((d) => ({ ...d, controls: { ...d.controls, [key]: value } }))} />
            ))
          : null}
      </div>
    </fieldset>
  );
}
