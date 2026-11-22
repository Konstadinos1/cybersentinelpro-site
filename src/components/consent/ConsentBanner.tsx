"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import type { Dictionary } from "@/i18n/dictionaries/fr";
import { useConsent } from "./ConsentProvider";

interface ConsentBannerProps {
  copy: Dictionary["consent"];
  privacyHref: string;
}

/** Accept and Refuse carry equal weight; settings offer the same choice per purpose. */
export function ConsentBanner({ copy, privacyHref }: ConsentBannerProps) {
  const { choice, settingsOpen, decide, openSettings, closeSettings } = useConsent();
  const [analyticsDraft, setAnalyticsDraft] = useState(false);
  const titleId = useId();
  const analyticsId = useId();

  useEffect(() => {
    if (settingsOpen) setAnalyticsDraft(choice?.analytics ?? false);
  }, [settingsOpen, choice]);

  const visible = choice === null || settingsOpen;
  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
      data-consent-banner
      className="panel fixed inset-x-3 bottom-3 z-50 max-w-xl rounded-lg p-5 shadow-2xl shadow-black/40 sm:inset-x-auto sm:bottom-6 sm:left-6"
    >
      <h2 id={titleId} className="text-lg font-semibold">
        {settingsOpen ? copy.settingsTitle : copy.title}
      </h2>
      {settingsOpen ? (
        <div className="mt-3 space-y-4 text-sm text-mist">
          <div>
            <p className="font-semibold text-frost">{copy.essential}</p>
            <p>{copy.essentialBody}</p>
          </div>
          <label htmlFor={analyticsId} className="flex items-start gap-3">
            <input
              id={analyticsId}
              type="checkbox"
              className="mt-1 size-4 accent-[var(--color-fleur)]"
              checked={analyticsDraft}
              onChange={(event) => setAnalyticsDraft(event.target.checked)}
            />
            <span>
              <span className="block font-semibold text-frost">{copy.analytics}</span>
              {copy.analyticsBody}
            </span>
          </label>
        </div>
      ) : (
        <p className="mt-2 text-sm text-mist">
          {copy.body}{" "}
          <Link href={privacyHref} className="text-ice underline underline-offset-2">
            {copy.privacyLink}
          </Link>
        </p>
      )}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
        {settingsOpen ? (
          <>
            <button type="button" className="btn-primary col-span-2" onClick={() => decide(analyticsDraft)}>
              {copy.save}
            </button>
            {choice ? (
              <button type="button" className="btn-secondary col-span-2" onClick={closeSettings}>
                {copy.close}
              </button>
            ) : null}
          </>
        ) : (
          <>
            <button type="button" className="btn-secondary" data-consent="refuse" onClick={() => decide(false)}>
              {copy.refuse}
            </button>
            <button type="button" className="btn-secondary" data-consent="accept" onClick={() => decide(true)}>
              {copy.accept}
            </button>
            <button type="button" className="col-span-2 text-sm text-ice underline underline-offset-2 sm:ml-auto" onClick={openSettings}>
              {copy.settings}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export function ConsentSettingsButton({ label }: { label: string }) {
  const { openSettings } = useConsent();
  return (
    <button type="button" onClick={openSettings} className="text-mist underline underline-offset-2 hover:text-frost">
      {label}
    </button>
  );
}
