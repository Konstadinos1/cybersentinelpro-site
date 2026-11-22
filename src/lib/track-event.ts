import { siteConfig } from "./site-config";

/**
 * Typed analytics events. Every call is dropped until the visitor opts in (Law 25).
 * Props never carry personal information: only enums, counts and scores.
 */
export type TrackedEvent =
  | { name: "cta_click"; props: { target: "diagnostic" | "sandbox" | "partners" | "book" } }
  | { name: "calculator_step"; props: { step: number } }
  | { name: "calculator_complete"; props: { score: number; exposure_tier: string } }
  | { name: "lead_submit"; props: { source: "calculator" | "partner"; status: number } }
  | { name: "sandbox_run"; props: { preset: string } }
  | { name: "locale_switch"; props: { to: "fr" | "en" } }
  | { name: "audio_toggle"; props: { on: boolean } };

type PlausibleFn = (name: string, options?: { props?: Record<string, string | number | boolean> }) => void;
type VercelFn = (event: "event", payload: { name: string; data?: Record<string, string | number | boolean> }) => void;

declare global {
  interface Window {
    plausible?: PlausibleFn;
    va?: VercelFn;
  }
}

let analyticsAllowed = false;

export function setAnalyticsConsent(allowed: boolean): void {
  analyticsAllowed = allowed;
}

export function isAnalyticsAllowed(): boolean {
  return analyticsAllowed;
}

export function trackEvent<E extends TrackedEvent>(name: E["name"], props: E["props"]): void {
  if (!analyticsAllowed || typeof window === "undefined") return;
  if (siteConfig.analyticsProvider === "plausible") window.plausible?.(name, { props });
  if (siteConfig.analyticsProvider === "vercel") window.va?.("event", { name, data: props });
}
