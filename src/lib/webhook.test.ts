import { createHmac } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import { buildLeadRecord } from "./lead-record";
import { leadSchema } from "./lead-schema";
import { E2E_ANSWERS } from "./test-fixtures";
import { buildLeadWebhookPayload, dispatchLeadWebhook, signWebhookBody } from "./webhook";

const secret = "test-secret-0123456789";
const lead = buildLeadRecord(
  leadSchema.parse({ source: "calculator", locale: "en", full_name: "Luc Gagnon", work_email: "luc@client-exemple.ca", company: "Client Exemple", consent_contact: true, ...E2E_ANSWERS }),
  { id: "11111111-1111-4111-8111-111111111111", now: new Date("2026-11-22T12:00:00Z") },
).record;

describe("signWebhookBody", () => {
  it("is HMAC-SHA256 over timestamp.rawBody", () => {
    const body = '{"a":1}';
    const expected = createHmac("sha256", secret).update(`1700000000.${body}`).digest("hex");
    expect(signWebhookBody(secret, 1700000000, body)).toBe(`sha256=${expected}`);
  });
});

describe("buildLeadWebhookPayload", () => {
  it("follows the SPEC §11 envelope", () => {
    const payload = buildLeadWebhookPayload(lead);
    expect(payload).toMatchObject({ event: "lead.created", version: 1, source: "calculator", partner: null, qualification: { score: 22, exposure_tier: "critical" } });
  });
});

describe("dispatchLeadWebhook", () => {
  it("is skipped without configuration", async () => {
    expect(await dispatchLeadWebhook({}, lead)).toBe("skipped");
  });

  it("retries once, then reports failure without throwing", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error("down"));
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(await dispatchLeadWebhook({ url: "https://crm.example/hook", secret }, lead)).toBe("failed");
    expect(fetchMock).toHaveBeenCalledTimes(2);
    vi.unstubAllGlobals();
  });

  it("sends signed headers", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    expect(await dispatchLeadWebhook({ url: "https://crm.example/hook", secret }, lead)).toBe("sent");
    const init = fetchMock.mock.calls[0]![1] as RequestInit & { headers: Record<string, string> };
    expect(signWebhookBody(secret, Number(init.headers["X-CSP-Timestamp"]), String(init.body))).toBe(init.headers["X-CSP-Signature"]);
    vi.unstubAllGlobals();
  });
});
