import { z } from "zod";
import { PARTNER_TYPES } from "./partner-types";
import { AI_STACK_ITEMS, HEADCOUNT_BANDS, VERTICALS } from "./scoring";

export { PARTNER_TYPES, type PartnerType } from "./partner-types";

/** Request contract for POST /api/leads (SPEC §10). Unknown fields are rejected. */

export const MAX_LEAD_BODY_BYTES = 8 * 1024;

const NAME_MIN = 2;
const NAME_MAX = 120;
const COMPANY_MAX = 160;
const EMAIL_MAX = 254;
const MESSAGE_MAX = 2000;
const UTM_VALUE_MAX = 200;

const utmValue = z.string().trim().max(UTM_VALUE_MAX).optional();

const utmSchema = z
  .strictObject({
    utm_source: utmValue,
    utm_medium: utmValue,
    utm_campaign: utmValue,
    utm_term: utmValue,
    utm_content: utmValue,
  })
  .default({});

const contactFields = {
  locale: z.enum(["fr", "en"]),
  full_name: z.string().trim().min(NAME_MIN).max(NAME_MAX),
  work_email: z.email().max(EMAIL_MAX),
  company: z.string().trim().min(NAME_MIN).max(COMPANY_MAX),
  consent_contact: z.literal(true),
  consent_marketing: z.boolean().default(false),
  utm: utmSchema,
  /** Honeypot: hidden from people, filled by bots. */
  website: z.string().max(0).optional(),
  /** Accepted so older clients do not fail, but never read: the server recomputes the score. */
  score: z.unknown().optional(),
};

export const calculatorLeadSchema = z.strictObject({
  source: z.literal("calculator"),
  ...contactFields,
  headcount_band: z.enum(HEADCOUNT_BANDS),
  vertical: z.enum(VERTICALS),
  ai_stack: z
    .array(z.enum(AI_STACK_ITEMS))
    .min(1)
    .max(AI_STACK_ITEMS.length)
    .refine((items) => new Set(items).size === items.length, { message: "duplicate_ai_stack" }),
  controls: z.strictObject({
    privacy_officer: z.boolean(),
    incident_register: z.boolean(),
    efvp: z.boolean(),
  }),
});

export const partnerLeadSchema = z.strictObject({
  source: z.literal("partner"),
  ...contactFields,
  partner_type: z.enum(PARTNER_TYPES),
  message: z.string().trim().max(MESSAGE_MAX).optional(),
});

export const leadSchema = z.discriminatedUnion("source", [calculatorLeadSchema, partnerLeadSchema]);

export type LeadInput = z.infer<typeof leadSchema>;
export type CalculatorLeadInput = z.infer<typeof calculatorLeadSchema>;
export type PartnerLeadInput = z.infer<typeof partnerLeadSchema>;

/** Field names the forms can attach an inline error to. */
export type LeadFieldName = "full_name" | "work_email" | "company" | "consent_contact" | "partner_type" | "message";

export interface LeadIssue {
  field: string;
  code: string;
}

export function toLeadIssues(error: z.ZodError): LeadIssue[] {
  return error.issues.map((issue) => ({ field: issue.path.join(".") || "body", code: issue.code }));
}
