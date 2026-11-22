/** First-party consent record (SPEC §12): versioned, 12 months, nothing pre-checked. */
export const CONSENT_COOKIE = "csp_consent";
export const CONSENT_VERSION = 1;
const CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export interface ConsentChoice {
  v: number;
  analytics: boolean;
  at: string;
}

export function readConsentCookie(cookieHeader: string): ConsentChoice | null {
  const raw = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${CONSENT_COOKIE}=`))
    ?.slice(CONSENT_COOKIE.length + 1);
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(decodeURIComponent(raw));
    if (typeof parsed !== "object" || parsed === null) return null;
    const choice = parsed as Partial<ConsentChoice>;
    if (choice.v !== CONSENT_VERSION || typeof choice.analytics !== "boolean" || typeof choice.at !== "string") {
      return null;
    }
    return { v: choice.v, analytics: choice.analytics, at: choice.at };
  } catch {
    return null;
  }
}

export function writeConsentCookie(analytics: boolean): ConsentChoice {
  const choice: ConsentChoice = { v: CONSENT_VERSION, analytics, at: new Date().toISOString() };
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${CONSENT_COOKIE}=${encodeURIComponent(JSON.stringify(choice))}; Max-Age=${CONSENT_MAX_AGE_SECONDS}; Path=/; SameSite=Lax${secure}`;
  return choice;
}
