"use client";

import { useEffect, useMemo, useState } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/fr";
import { interpolate } from "@/i18n/interpolate";
import { playGlassClick } from "@/lib/audio";
import { evaluateAgentRequest, RULES_IN_ORDER, runGuardedRequest, type GuardResult } from "@/lib/sandbox-engine";
import { trackEvent } from "@/lib/track-event";
import { replayFirewall } from "@/scene/scene-bus";
import { buildPreset, PRESET_IDS, type PresetFixture, type PresetId } from "./presets";

interface Run {
  preset: PresetId;
  fixture: PresetFixture;
  result: GuardResult;
  at: string;
}

function execute(preset: PresetId, locale: Locale): Run {
  const fixture = buildPreset(preset, locale);
  return { preset, fixture, result: runGuardedRequest(fixture.request), at: new Date().toISOString() };
}

/**
 * Server-safe first render: same decision, but no clock reads, so the HTML hydrates
 * identically. The real timed run replaces it right after mount.
 */
function initialRun(preset: PresetId, locale: Locale): Run {
  const fixture = buildPreset(preset, locale);
  const decision = evaluateAgentRequest(fixture.request);
  return { preset, fixture, result: { ...decision, latency_ms: 0, logged: decision.verdict === "BLOCKED" }, at: "" };
}

function auditLog(run: Run): string {
  const { result } = run;
  return JSON.stringify(
    {
      event: "guard.decision",
      preset: run.preset,
      verdict: result.verdict,
      rules_evaluated: RULES_IN_ORDER,
      rule_id: result.rule_id,
      owasp_ref: result.owasp_ref,
      reason: result.reason,
      matched: result.matched,
      latency_ms: result.latency_ms,
      logged: result.logged,
      at: run.at,
    },
    null,
    2,
  );
}

export function Sandbox({ locale, copy }: { locale: Locale; copy: Dictionary["sandbox"] }) {
  // The first preset is evaluated up front so neither pane is ever empty.
  const [run, setRun] = useState<Run>(() => initialRun(PRESET_IDS[0], locale));

  useEffect(() => {
    setRun(execute(PRESET_IDS[0], locale));
  }, [locale]);

  function launch(preset: PresetId) {
    const next = execute(preset, locale);
    setRun(next);
    // The firewall scene shows a packet deflecting, which only matches an attack.
    if (next.fixture.kind === "attack") replayFirewall();
    playGlassClick();
    trackEvent("sandbox_run", { preset });
  }

  return (
    <div className="space-y-6">
      <div role="group" aria-label={copy.presetsLabel} className="grid gap-2.5 md:grid-cols-2 xl:grid-cols-4">
        {PRESET_IDS.map((preset) => (
          <button
            key={preset}
            type="button"
            data-preset={preset}
            aria-pressed={run.preset === preset}
            onClick={() => launch(preset)}
            className={`flex flex-col justify-start rounded-md border p-4 text-left transition-colors ${run.preset === preset ? "border-ice bg-fleur/20" : "border-line-strong hover:border-ice/60"}`}
          >
            <span className="block font-semibold">{copy.presets[preset].label}</span>
            <span className="mt-1 block text-sm text-mist">{copy.presets[preset].summary}</span>
          </button>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <UnprotectedPane run={run} copy={copy} />
        <GuardedPane run={run} copy={copy} />
      </div>
      <p className="text-sm text-mist">{copy.note}</p>
    </div>
  );
}

function UnprotectedPane({ run, copy }: { run: Run; copy: Dictionary["sandbox"] }) {
  const routine = run.fixture.kind === "routine";
  return (
    <article data-pane="unprotected" className="panel flex flex-col rounded-lg p-5">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-semibold">{copy.unprotectedTitle}</h3>
        <span className="hud-text rounded-sm border border-line-strong px-2 py-0.5 text-mist">{copy.simulationTag}</span>
      </header>
      <p className="mt-4 text-xs text-mist">{routine ? copy.routineLabel : copy.attackLabel}</p>
      <p data-attack-text className="mt-1 whitespace-pre-wrap break-words font-mono text-sm">{run.fixture.typed}</p>
      {run.fixture.hidden ? (
        <>
          <p className="mt-3 text-xs text-mist">{copy.hiddenLabel}</p>
          <p className="mt-1 whitespace-pre-wrap break-all font-mono text-xs text-amber">{run.fixture.hidden}</p>
        </>
      ) : null}
      <pre data-unprotected-output className="mt-4 max-h-56 flex-1 overflow-auto whitespace-pre-wrap break-words rounded-md bg-night/80 p-3 font-mono text-xs text-frost/90">
        {run.fixture.unprotectedOutput}
      </pre>
      <p data-verdict={routine ? "no-breach" : "breach"} className={`hud-text mt-4 font-semibold ${routine ? "text-mist" : "text-breach"}`}>
        {routine ? copy.noBreach : copy.breach}
      </p>
    </article>
  );
}

function GuardedPane({ run, copy }: { run: Run; copy: Dictionary["sandbox"] }) {
  const log = useMemo(() => auditLog(run), [run]);
  const { result } = run;
  const rows: ReadonlyArray<readonly [string, string]> = [
    [copy.rule, result.rule_id ?? interpolate(copy.noRuleTriggered, { count: RULES_IN_ORDER.length })],
    [copy.owasp, result.owasp_ref ?? "—"],
    [copy.latency, `${result.latency_ms.toFixed(4)} ms`],
  ];
  return (
    <article data-pane="guarded" className="panel flex flex-col rounded-lg p-5">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-semibold">{copy.guardedTitle}</h3>
        <span className="hud-text rounded-sm border border-ice/50 px-2 py-0.5 text-ice">{copy.liveTag}</span>
      </header>
      <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="contents">
            <dt className="text-mist">{label}</dt>
            <dd className="font-mono">{value}</dd>
          </div>
        ))}
      </dl>
      <details className="mt-4 flex-1">
        <summary className="cursor-pointer text-sm text-ice">{copy.auditJson}</summary>
        <pre data-audit-json className="mt-2 max-h-56 overflow-auto rounded-md bg-night/80 p-3 font-mono text-xs">{log}</pre>
      </details>
      <p data-verdict={result.verdict === "BLOCKED" ? "blocked" : "allowed"} className="hud-text mt-4 font-semibold text-ice">
        {result.verdict === "BLOCKED" ? copy.blocked : copy.allowed}
      </p>
    </article>
  );
}
