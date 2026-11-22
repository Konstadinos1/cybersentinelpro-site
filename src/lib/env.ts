import "server-only";
import { z } from "zod";

/** Server-side environment. Every value is optional so previews run in mock mode. */
const serverEnvSchema = z.object({
  SUPABASE_URL: z.url().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  CRM_WEBHOOK_URL: z.url().optional(),
  CRM_WEBHOOK_SECRET: z.string().min(16).optional(),
  RESEND_API_KEY: z.string().min(1).optional(),
  LEAD_NOTIFY_EMAIL: z.email().optional(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

function emptyToUndefined(value: string | undefined): string | undefined {
  return value && value.trim() !== "" ? value.trim() : undefined;
}

export function getServerEnv(): ServerEnv {
  const parsed = serverEnvSchema.safeParse({
    SUPABASE_URL: emptyToUndefined(process.env.SUPABASE_URL),
    SUPABASE_SERVICE_ROLE_KEY: emptyToUndefined(process.env.SUPABASE_SERVICE_ROLE_KEY),
    CRM_WEBHOOK_URL: emptyToUndefined(process.env.CRM_WEBHOOK_URL),
    CRM_WEBHOOK_SECRET: emptyToUndefined(process.env.CRM_WEBHOOK_SECRET),
    RESEND_API_KEY: emptyToUndefined(process.env.RESEND_API_KEY),
    LEAD_NOTIFY_EMAIL: emptyToUndefined(process.env.LEAD_NOTIFY_EMAIL),
  });
  if (!parsed.success) {
    // A malformed value is a deployment error; fail loudly instead of silently running in mock mode.
    throw new Error(`Invalid server environment: ${parsed.error.issues.map((i) => i.path.join(".")).join(", ")}`);
  }
  return parsed.data;
}

export function isStorageConfigured(env: ServerEnv): env is ServerEnv & {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
} {
  return Boolean(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY);
}
