import "server-only";
import type { LeadRecord } from "./lead-record";

/**
 * Lead notification stub (SPEC §11). It no-ops unless RESEND_API_KEY is set, so no
 * personal information leaves the server until the owner turns it on.
 */
export async function notifyNewLead(
  config: { apiKey?: string; to?: string },
  lead: Pick<LeadRecord, "id" | "source" | "company">,
): Promise<"sent" | "skipped"> {
  if (!config.apiKey || !config.to) return "skipped";
  // Sending is intentionally not wired in v1; the CRM webhook is the system of record.
  console.warn(`Resend is configured but not implemented yet; lead ${lead.id} (${lead.source}) not emailed.`);
  return "skipped";
}
