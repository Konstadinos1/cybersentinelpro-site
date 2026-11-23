import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { LeadRecord } from "./lead-record";
import type { WebhookStatus } from "./webhook";

const LEADS_TABLE = "leads";

let cachedClient: SupabaseClient | null = null;

/** Service-role client: server only, never sent to the browser. RLS blocks every other role. */
function getSupabaseClient(url: string, serviceRoleKey: string): SupabaseClient {
  cachedClient ??= createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cachedClient;
}

export async function insertLeadRecord(
  credentials: { url: string; serviceRoleKey: string },
  record: LeadRecord,
): Promise<void> {
  const client = getSupabaseClient(credentials.url, credentials.serviceRoleKey);
  const { error } = await client.from(LEADS_TABLE).insert({ ...record, webhook_status: "pending" });
  if (error) throw new Error(`lead insert failed: ${error.code ?? "unknown"}`);
}

export async function updateWebhookStatus(
  credentials: { url: string; serviceRoleKey: string },
  leadId: string,
  status: WebhookStatus,
): Promise<void> {
  const client = getSupabaseClient(credentials.url, credentials.serviceRoleKey);
  const { error } = await client.from(LEADS_TABLE).update({ webhook_status: status }).eq("id", leadId);
  if (error) console.error("webhook status update failed:", error.code ?? "unknown");
}
