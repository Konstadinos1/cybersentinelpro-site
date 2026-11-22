"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { setAnalyticsConsent } from "@/lib/track-event";
import { ANALYTICS_SCRIPT_SRC, siteConfig } from "@/lib/site-config";
import { readConsentCookie, writeConsentCookie, type ConsentChoice } from "./consent-cookie";

interface ConsentContextValue {
  /** `undefined` until the cookie has been read on the client; `null` means no choice yet. */
  choice: ConsentChoice | null | undefined;
  settingsOpen: boolean;
  decide: (analytics: boolean) => void;
  openSettings: () => void;
  closeSettings: () => void;
}

const ConsentContext = createContext<ConsentContextValue | null>(null);
const ANALYTICS_SCRIPT_ID = "csp-analytics";

/** The analytics tag is injected only after an explicit opt-in. */
function injectAnalyticsScript(): void {
  const provider = siteConfig.analyticsProvider;
  if (provider === "none" || document.getElementById(ANALYTICS_SCRIPT_ID)) return;
  const script = document.createElement("script");
  script.id = ANALYTICS_SCRIPT_ID;
  script.defer = true;
  script.src = ANALYTICS_SCRIPT_SRC[provider];
  if (provider === "plausible") script.dataset.domain = new URL(siteConfig.siteUrl).hostname;
  document.head.appendChild(script);
}

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [choice, setChoice] = useState<ConsentChoice | null | undefined>(undefined);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    setChoice(readConsentCookie(document.cookie));
  }, []);

  useEffect(() => {
    const allowed = choice?.analytics === true;
    setAnalyticsConsent(allowed);
    if (allowed) injectAnalyticsScript();
  }, [choice]);

  const decide = useCallback((analytics: boolean) => {
    setChoice(writeConsentCookie(analytics));
    setSettingsOpen(false);
  }, []);
  const openSettings = useCallback(() => setSettingsOpen(true), []);
  const closeSettings = useCallback(() => setSettingsOpen(false), []);

  const value = useMemo(
    () => ({ choice, settingsOpen, decide, openSettings, closeSettings }),
    [choice, settingsOpen, decide, openSettings, closeSettings],
  );
  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}

export function useConsent(): ConsentContextValue {
  const context = useContext(ConsentContext);
  if (!context) throw new Error("useConsent must be used inside ConsentProvider");
  return context;
}
