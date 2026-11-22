import { randomUUID } from "node:crypto";
import { after, NextResponse, type NextRequest } from "next/server";
import { notifyNewLead } from "@/lib/email";
import { getServerEnv, isStorageConfigured, type ServerEnv } from "@/lib/env";
import { buildLeadRecord, type LeadRecord } from "@/lib/lead-record";
import { leadSchema, MAX_LEAD_BODY_BYTES, toLeadIssues } from "@/lib/lead-schema";
import { consumeRateLimit } from "@/lib/rate-limit";
import { insertLeadRecord, updateWebhookStatus } from "@/lib/supabase-server";
import { dispatchLeadWebhook } from "@/lib/webhook";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const JSON_CONTENT_TYPE = "application/json";

function errorResponse(status: number, error: string, extra: Record<string, unknown> = {}) {
  return NextResponse.json({ ok: false, error, ...extra }, { status });
}

function clientKey(request: NextRequest): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

async function readBoundedBody(request: NextRequest): Promise<string | null> {
  const declared = Number(request.headers.get("content-length") ?? "0");
  if (declared > MAX_LEAD_BODY_BYTES) return null;
  const raw = await request.text();
  return new TextEncoder().encode(raw).byteLength > MAX_LEAD_BODY_BYTES ? null : raw;
}

function parseJson(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

/** Runs after the response is sent so a slow CRM never delays the visitor. */
function scheduleFollowUps(env: ServerEnv & { SUPABASE_URL: string; SUPABASE_SERVICE_ROLE_KEY: string }, record: LeadRecord) {
  after(async () => {
    const credentials = { url: env.SUPABASE_URL, serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY };
    const status = await dispatchLeadWebhook({ url: env.CRM_WEBHOOK_URL, secret: env.CRM_WEBHOOK_SECRET }, record);
    await updateWebhookStatus(credentials, record.id, status);
    await notifyNewLead({ apiKey: env.RESEND_API_KEY, to: env.LEAD_NOTIFY_EMAIL }, record);
  });
}

export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().startsWith(JSON_CONTENT_TYPE)) return errorResponse(415, "unsupported_media_type");

  const raw = await readBoundedBody(request);
  if (raw === null) return errorResponse(413, "payload_too_large");
  if (!consumeRateLimit(clientKey(request))) return errorResponse(429, "rate_limited");

  const parsed = leadSchema.safeParse(parseJson(raw));
  if (!parsed.success) return errorResponse(400, "validation", { issues: toLeadIssues(parsed.error) });

  const { record, assessment } = buildLeadRecord(parsed.data, { id: randomUUID(), now: new Date() });
  const result = { ok: true, id: record.id, ...(assessment ?? {}) };
  const env = getServerEnv();

  if (!isStorageConfigured(env)) return NextResponse.json({ ...result, mock: true }, { status: 201 });

  try {
    await insertLeadRecord({ url: env.SUPABASE_URL, serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY }, record);
  } catch (error) {
    console.error("lead storage error:", error instanceof Error ? error.message : "unknown");
    return errorResponse(500, "storage");
  }
  scheduleFollowUps(env, record);
  return NextResponse.json(result, { status: 201 });
}
