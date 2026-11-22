import { describe, expect, it } from "vitest";
import { assessReadiness, classifyExposure, computeAiPenalty, computeReadinessScore, recommendTier, selectTopFixes, type ReadinessAnswers } from "./scoring";
import { E2E_ANSWERS, E2E_EXPECTED_SCORE } from "./test-fixtures";


const allControls = { privacy_officer: true, incident_register: true, efvp: true } as const;
const noControls = { privacy_officer: false, incident_register: false, efvp: false } as const;

describe("computeReadinessScore", () => {
  it("matches the SPEC §7 formula for the E2E answer set", () => {
    // 25 + 25 (one control) - 20 (Copilot 5 + agents 15) - 8 (accounting/legal) = 22
    expect(computeReadinessScore(E2E_ANSWERS)).toBe(E2E_EXPECTED_SCORE);
  });

  it("caps the AI penalty at 25", () => {
    expect(computeAiPenalty(["copilot_chatgpt", "voice_ai", "custom_agents_rag"])).toBe(25);
  });

  it("ignores duplicate AI items", () => {
    expect(computeAiPenalty(["voice_ai", "voice_ai"])).toBe(10);
  });

  it("clamps to 0..100", () => {
    const worst: ReadinessAnswers = { headcount_band: "151-250+", vertical: "clinics_health", ai_stack: ["custom_agents_rag", "voice_ai"], controls: noControls };
    const best: ReadinessAnswers = { headcount_band: "25-50", vertical: "other", ai_stack: ["exploring"], controls: allControls };
    expect(computeReadinessScore(worst)).toBe(0);
    expect(computeReadinessScore(best)).toBe(97);
  });
});

describe("classifyExposure", () => {
  it.each([
    [100, "low"],
    [75, "low"],
    [74, "moderate"],
    [50, "moderate"],
    [49, "high"],
    [25, "high"],
    [24, "critical"],
    [0, "critical"],
  ] as const)("score %i is %s", (score, tier) => {
    expect(classifyExposure(score)).toBe(tier);
  });
});

describe("recommendTier", () => {
  it("flags tier2 for agents or voice AI with a score of 50 or more", () => {
    const answers: ReadinessAnswers = { ...E2E_ANSWERS, controls: allControls };
    expect(recommendTier(answers, computeReadinessScore(answers))).toBe("tier2");
  });

  it("stays on tier1 below 50 or without agents and voice AI", () => {
    expect(recommendTier(E2E_ANSWERS, E2E_EXPECTED_SCORE)).toBe("tier1");
    expect(recommendTier({ ...E2E_ANSWERS, ai_stack: ["copilot_chatgpt"] }, 90)).toBe("tier1");
  });
});

describe("selectTopFixes", () => {
  it("lists missing controls first, then AI fixes by risk", () => {
    expect(selectTopFixes(E2E_ANSWERS)).toEqual(["open_incident_register", "run_efvp", "redteam_agents"]);
  });

  it("always returns three fixes", () => {
    const covered: ReadinessAnswers = { headcount_band: "25-50", vertical: "other", ai_stack: ["exploring"], controls: allControls };
    expect(selectTopFixes(covered)).toEqual(["ai_policy_before_pilot", "map_cross_border_transfers", "tabletop_incident_drill"]);
  });
});

describe("assessReadiness", () => {
  it("bundles score, tier, recommendation and fixes", () => {
    expect(assessReadiness(E2E_ANSWERS)).toEqual({
      score: 22,
      exposure_tier: "critical",
      recommended_tier: "tier1",
      fixes: ["open_incident_register", "run_efvp", "redteam_agents"],
    });
  });
});
