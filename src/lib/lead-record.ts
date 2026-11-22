import type { LeadInput } from "./lead-schema";
import { assessReadiness, type ExposureTier, type OfferTier, type ReadinessAssessment } from "./scoring";

/** Row shape of `public.leads` (supabase/migrations/001_leads.sql). */
export interface LeadRecord {
  id: string;
  created_at: string;
  source: "calculator" | "partner";
  locale: "fr" | "en";
  full_name: string;
  work_email: string;
  company: string;
  headcount_band: string | null;
  vertical: string | null;
  ai_stack: string[];
  controls: Record<string, boolean>;
  score: number | null;
  exposure_tier: ExposureTier | null;
  recommended_tier: OfferTier | null;
  partner_type: string | null;
  message: string | null;
  consent_contact: boolean;
  consent_marketing: boolean;
  consent_at: string;
  utm: Record<string, string>;
}

function compactUtm(utm: Record<string, string | undefined>): Record<string, string> {
  return Object.fromEntries(Object.entries(utm).filter((entry): entry is [string, string] => Boolean(entry[1])));
}

/** The assessment always comes from the server-side recomputation, never from the request. */
export function buildLeadRecord(
  input: LeadInput,
  ids: { id: string; now: Date },
): { record: LeadRecord; assessment: ReadinessAssessment | null } {
  const assessment = input.source === "calculator" ? assessReadiness(input) : null;
  const timestamp = ids.now.toISOString();
  const record: LeadRecord = {
    id: ids.id,
    created_at: timestamp,
    source: input.source,
    locale: input.locale,
    full_name: input.full_name,
    work_email: input.work_email.toLowerCase(),
    company: input.company,
    headcount_band: input.source === "calculator" ? input.headcount_band : null,
    vertical: input.source === "calculator" ? input.vertical : null,
    ai_stack: input.source === "calculator" ? [...input.ai_stack] : [],
    controls: input.source === "calculator" ? { ...input.controls } : {},
    score: assessment?.score ?? null,
    exposure_tier: assessment?.exposure_tier ?? null,
    recommended_tier: assessment?.recommended_tier ?? null,
    partner_type: input.source === "partner" ? input.partner_type : null,
    message: input.source === "partner" ? (input.message ?? null) : null,
    consent_contact: input.consent_contact,
    consent_marketing: input.consent_marketing,
    consent_at: timestamp,
    utm: compactUtm(input.utm),
  };
  return { record, assessment };
}
