"use client";

import { useEffect, useRef, useState } from "react";
import type { ExposureTier, ReadinessAssessment } from "@/lib/scoring";
import { CALCOM_ORIGIN } from "@/lib/site-config";
import { trackEvent } from "@/lib/track-event";
import type { CalculatorProps } from "./Calculator";

const COUNT_UP_MS = 1100;
const TIER_COLORS: Record<ExposureTier, string> = {
  low: "text-ice",
  moderate: "text-amber",
  high: "text-amber",
  critical: "text-breach",
};

/** Counts up to the score once; reduced motion shows the final number immediately. */
function useCountUp(target: number): number {
  const [value, setValue] = useState(target);
  const started = useRef(false);
  useEffect(() => {
    if (started.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    started.current = true;
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / COUNT_UP_MS);
      setValue(Math.round(target * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    setValue(0);
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target]);
  return value;
}

interface ResultViewProps extends CalculatorProps {
  assessment: ReadinessAssessment;
  saved: boolean;
  submitting: boolean;
  onRetry: () => void;
  onRestart: () => void;
}

export function ResultView({ copy, assessment, saved, submitting, onRetry, onRestart, calcomLink, deepAuditUrl }: ResultViewProps) {
  const shown = useCountUp(assessment.score);
  const result = copy.result;
  return (
    <div data-calculator-result data-score={assessment.score} data-exposure={assessment.exposure_tier} className="panel rounded-lg p-5 sm:p-8" aria-live="polite">
      {!saved ? (
        <div role="alert" data-save-error className="mb-6 rounded-md border border-breach/60 bg-breach/10 p-4 text-sm">
          <p>{result.savedError}</p>
          <button type="button" className="btn-secondary mt-3 min-h-10" onClick={onRetry} disabled={submitting}>
            {result.retry}
          </button>
        </div>
      ) : null}
      <div className="grid gap-8 lg:grid-cols-[minmax(0,15rem)_1fr]">
        <div>
          <h3 className="text-xl font-semibold">{result.title}</h3>
          <p className="mt-3 flex items-baseline gap-2">
            <span data-score-value className="font-display text-7xl font-semibold tabular-nums" style={{ minWidth: "3ch" }}>
              {shown}
            </span>
            <span className="text-mist">{result.outOf}</span>
          </p>
          <p className="mt-2">
            {result.exposureLabel} <span className={`font-semibold ${TIER_COLORS[assessment.exposure_tier]}`}>{result.tiers[assessment.exposure_tier]}</span>
          </p>
          <p className="mt-4 text-sm text-mist">{result.statutory}</p>
        </div>
        <div>
          <h4 className="font-display text-lg font-semibold">{result.fixesTitle}</h4>
          <ol className="mt-3 space-y-4">
            {assessment.fixes.map((fix, index) => (
              <li key={fix} data-fix={fix} className="grid grid-cols-[2rem_1fr] gap-2 border-l border-line-strong pl-4">
                <span className="hud-text pt-1 text-ice">{index + 1}</span>
                <span>
                  <span className="block font-semibold">{copy.fixes[fix].title}</span>
                  <span className="block text-sm text-mist">{copy.fixes[fix].body}</span>
                </span>
              </li>
            ))}
          </ol>
          <NextSteps copy={copy} assessment={assessment} calcomLink={calcomLink} deepAuditUrl={deepAuditUrl} onRestart={onRestart} />
        </div>
      </div>
      <details className="mt-8 text-sm text-mist">
        <summary className="cursor-pointer text-frost">{result.method}</summary>
        <p className="mt-2 max-w-2xl">{result.methodBody}</p>
      </details>
    </div>
  );
}

function NextSteps({
  copy,
  assessment,
  calcomLink,
  deepAuditUrl,
  onRestart,
}: Pick<ResultViewProps, "copy" | "assessment" | "calcomLink" | "deepAuditUrl" | "onRestart">) {
  const [bookingOpen, setBookingOpen] = useState(false);
  const result = copy.result;
  return (
    <div className="mt-8 border-t border-line pt-6">
      <p className="text-sm text-mist">{result.startTitle}</p>
      <p data-recommended={assessment.recommended_tier} className="mt-1 font-display text-xl font-semibold">
        {result.startTierName}
      </p>
      <p className="mt-1 text-sm text-mist">{assessment.recommended_tier === "tier2" ? result.nextStepTier2 : result.nextStepDefault}</p>
      <div className="mt-5 flex flex-wrap gap-3">
        {calcomLink ? (
          <button type="button" className="btn-primary" data-book onClick={() => (setBookingOpen(true), trackEvent("cta_click", { target: "book" }))}>
            {result.book}
          </button>
        ) : (
          <p className="text-sm">{result.noBooking}</p>
        )}
        {deepAuditUrl ? (
          <a href={deepAuditUrl} className="btn-secondary" data-deep-audit>
            {result.deepAudit}
          </a>
        ) : null}
        <button type="button" className="text-sm text-ice underline underline-offset-2" onClick={onRestart}>
          {result.restart}
        </button>
      </div>
      {calcomLink && bookingOpen ? (
        <div className="mt-5">
          <p className="mb-2 text-xs text-mist">{result.bookNotice}</p>
          <iframe title={result.book} src={`${CALCOM_ORIGIN}/${calcomLink}?embed=true`} className="h-[38rem] w-full rounded-md border border-line bg-white" loading="lazy" />
        </div>
      ) : null}
    </div>
  );
}
