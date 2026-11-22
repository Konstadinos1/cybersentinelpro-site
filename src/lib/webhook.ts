import { createHmac } from "node:crypto";
import type { LeadRecord } from "./lead-record";

/** CRM webhook contract (SPEC §11): HMAC-SHA256 over `timestamp + "." + rawBody`. */

export const WEBHOOK_TIMEOUT_MS = 3_000;
export const WEBHOOK_MAX_ATTEMPTS = 2;
export const WEBHOOK_VERSION = 1;

export type WebhookStatus = "pending" | "sent" | "failed" | "skipped";

export function signWebhookBody(secret: string, timestampSeconds: number, rawBody: string): string {
  const digest = createHmac("sha256", secret).update(`${timestampSeconds}.${rawBody}`).digest("hex");
  return `sha256=${digest}`;
}

export function buildLeadWebhookPayload(lead: LeadRecord) {
  return {
    event: "lead.created",
    version: WEBHOOK_VERSION,
    lead_id: lead.id,
    created_at: lead.created_at,
    source: lead.source,
    locale: lead.locale,
    contact: { full_name: lead.full_name, work_email: lead.work_email, company: lead.company },
    qualification: {
      headcount_band: lead.headcount_band,
      vertical: lead.vertical,
      ai_stack: lead.ai_stack,
      controls: lead.controls,
      score: lead.score,
      exposure_tier: lead.exposure_tier,
      recommended_tier: lead.recommended_tier,
    },
    partner: lead.source === "partner" ? { partner_type: lead.partner_type, message: lead.message } : null,
    consent: { contact: lead.consent_contact, marketing: lead.consent_marketing, at: lead.consent_at },
    utm: lead.utm,
  };
}

async function postOnce(url: string, secret: string, rawBody: string): Promise<boolean> {
  const timestamp = Math.floor(Date.now() / 1000);
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSP-Timestamp": String(timestamp),
      "X-CSP-Signature": signWebhookBody(secret, timestamp, rawBody),
    },
    body: rawBody,
    signal: AbortSignal.timeout(WEBHOOK_TIMEOUT_MS),
  });
  return response.ok;
}

/** One retry, never throws: a CRM outage must not reach the visitor. */
export async function dispatchLeadWebhook(
  config: { url?: string; secret?: string },
  lead: LeadRecord,
): Promise<WebhookStatus> {
  if (!config.url || !config.secret) return "skipped";
  const rawBody = JSON.stringify(buildLeadWebhookPayload(lead));
  for (let attempt = 1; attempt <= WEBHOOK_MAX_ATTEMPTS; attempt += 1) {
    try {
      if (await postOnce(config.url, config.secret, rawBody)) return "sent";
    } catch (error) {
      console.error(`CRM webhook attempt ${attempt} failed:`, error instanceof Error ? error.name : "unknown");
    }
  }
  return "failed";
}
