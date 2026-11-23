import { describe, expect, it } from "vitest";
import { buildLeadRecord } from "./lead-record";
import { leadSchema } from "./lead-schema";
import { E2E_ANSWERS, E2E_EXPECTED_SCORE } from "./test-fixtures";

const contact = { locale: "fr", full_name: "Marie Tremblay", work_email: "marie@groupe-exemple.ca", company: "Groupe Exemple inc.", consent_contact: true };
const calculator = { source: "calculator", ...contact, ...E2E_ANSWERS };

describe("leadSchema", () => {
  it("accepts a calculator lead and fills defaults", () => {
    const parsed = leadSchema.parse(calculator);
    expect(parsed.consent_marketing).toBe(false);
    expect(parsed.utm).toEqual({});
  });

  it("accepts a partner lead", () => {
    expect(leadSchema.safeParse({ source: "partner", ...contact, partner_type: "msp", message: "Bonjour" }).success).toBe(true);
  });

  it.each([
    ["invalid email", { work_email: "not-an-email" }, "work_email"],
    ["missing consent", { consent_contact: false }, "consent_contact"],
    ["filled honeypot", { website: "https://spam.example" }, "website"],
    ["unknown field", { ip: "1.2.3.4" }, ""],
    ["unknown utm key", { utm: { gclid: "x" } }, "utm"],
  ])("rejects %s", (_label, patch, field) => {
    const result = leadSchema.safeParse({ ...calculator, ...patch });
    expect(result.success).toBe(false);
    if (!result.success && field) expect(result.error.issues.some((issue) => issue.path.join(".").startsWith(field))).toBe(true);
  });

  it("rejects a partner lead without a partner type", () => {
    const result = leadSchema.safeParse({ source: "partner", ...contact });
    expect(result.success).toBe(false);
  });
});

describe("buildLeadRecord", () => {
  it("recomputes the score on the server and ignores the client value", () => {
    const parsed = leadSchema.parse({ ...calculator, score: 99 });
    const { record, assessment } = buildLeadRecord(parsed, { id: "00000000-0000-4000-8000-000000000000", now: new Date("2026-11-22T12:00:00Z") });
    expect(record.score).toBe(E2E_EXPECTED_SCORE);
    expect(assessment?.score).toBe(E2E_EXPECTED_SCORE);
    expect(record.consent_at).toBe("2026-11-22T12:00:00.000Z");
    expect(record.work_email).toBe("marie@groupe-exemple.ca");
  });
});
