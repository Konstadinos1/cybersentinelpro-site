import type { ReadinessAnswers } from "./scoring";

/** The answer set the unit tests and the browser check (E4) both submit. */
export const E2E_ANSWERS: ReadinessAnswers = {
  headcount_band: "51-150",
  vertical: "accounting_legal",
  ai_stack: ["copilot_chatgpt", "custom_agents_rag"],
  controls: { privacy_officer: true, incident_register: false, efvp: false },
};

/** 25 + 25 (one control) - 20 (Copilot 5 + agents 15) - 8 (accounting/legal) = 22 */
export const E2E_EXPECTED_SCORE = 22;
