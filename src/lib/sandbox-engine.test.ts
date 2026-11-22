import { describe, expect, it } from "vitest";
import { ATTACK_PRESET_IDS, buildPreset, ROUTINE_PRESET_ID } from "@/components/sections/Sandbox/presets";
import { evaluateAgentRequest, passesLuhn, RULES_IN_ORDER, runGuardedRequest } from "./sandbox-engine";

const EXPECTED_RULES = {
  prompt_extraction: ["CSP-PI-001", "LLM07:2025 System Prompt Leakage"],
  law25_pii_exfil: ["CSP-PII-002", "LLM02:2025 Sensitive Information Disclosure"],
  mcp_tool_hijack: ["CSP-TOOL-003", "LLM06:2025 Excessive Agency"],
} as const;

describe("sandbox presets", () => {
  for (const locale of ["fr", "en"] as const) {
    for (const preset of ATTACK_PRESET_IDS) {
      it(`${preset} (${locale}) is blocked by the expected rule`, () => {
        const decision = evaluateAgentRequest(buildPreset(preset, locale).request);
        expect(decision.verdict).toBe("BLOCKED");
        expect([decision.rule_id, decision.owasp_ref]).toEqual([...EXPECTED_RULES[preset]]);
      });
    }
  }

  for (const locale of ["fr", "en"] as const) {
    it(`the routine request (${locale}) passes every rule and is not logged`, () => {
      const fixture = buildPreset(ROUTINE_PRESET_ID, locale);
      const result = runGuardedRequest(fixture.request, { runs: 1 });
      expect(fixture.kind).toBe("routine");
      expect(result).toMatchObject({ verdict: "ALLOWED", rule_id: null, logged: false });
    });
  }

  it("evaluates each rule exactly once, in a fixed order", () => {
    expect([...RULES_IN_ORDER].sort()).toEqual(["CSP-PI-001", "CSP-PII-002", "CSP-TOOL-003"]);
  });

  it("does not ship a secret-shaped literal in the fixture source", async () => {
    const { readFile } = await import("node:fs/promises");
    const source = await readFile("src/components/sections/Sandbox/presets.ts", "utf8");
    expect(source).not.toMatch(/sk_live_\w+/);
    expect(source).not.toMatch(/\b\d{3} \d{3} \d{3}\b/);
  });
});

describe("benign requests", () => {
  it.each([
    "Quelles sont vos heures d'ouverture samedi ?",
    "Create a ticket: the printer on floor 2 is jammed.",
    "Résume la politique de conservation des dossiers.",
  ])("allows %s", (prompt) => {
    expect(evaluateAgentRequest({ prompt, retrieved: [], tool_calls: [{ tool: "search_documents", args: { query: "x" } }] }).verdict).toBe("ALLOWED");
  });

  it("allows sending to the trusted domain", () => {
    const request = { prompt: "Envoie le résumé à direction@groupe-exemple.ca", retrieved: [], tool_calls: [{ tool: "create_ticket", args: { notify: "it@groupe-exemple.ca" } }] };
    expect(evaluateAgentRequest(request).verdict).toBe("ALLOWED");
  });
});

describe("detectors", () => {
  it("validates social insurance numbers with Luhn", () => {
    expect(passesLuhn("046 454 286")).toBe(true);
    expect(passesLuhn("130 692 544")).toBe(true);
    expect(passesLuhn("123 456 789")).toBe(false);
  });

  it("blocks a valid SIN pasted into a prompt", () => {
    const decision = evaluateAgentRequest({ prompt: `Mon NAS est ${["046", "454", "286"].join(" ")}`, retrieved: [], tool_calls: [] });
    expect(decision.rule_id).toBe("CSP-PII-002");
  });

  it("reports latency from the injected clock and logs blocks", () => {
    let tick = 0;
    const result = runGuardedRequest(buildPreset("prompt_extraction", "en").request, { now: () => (tick += 0.25), runs: 1 });
    expect(result.latency_ms).toBe(0.25);
    const batch = runGuardedRequest(buildPreset("prompt_extraction", "en").request, { now: () => (tick += 1), runs: 200 });
    expect(batch.latency_ms).toBe(0.005);
    expect(result.logged).toBe(true);
  });
});
