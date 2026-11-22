/**
 * Readiness scoring shared by the browser and the server (SPEC §7).
 * The server recomputes with this module and never trusts a client-sent score.
 */

export const HEADCOUNT_BANDS = ["25-50", "51-150", "151-250+"] as const;
export const VERTICALS = [
  "clinics_health",
  "accounting_legal",
  "retail_hospitality",
  "b2b_saas",
  "other",
] as const;
export const AI_STACK_ITEMS = ["copilot_chatgpt", "voice_ai", "custom_agents_rag", "exploring"] as const;
export const CONTROL_KEYS = ["privacy_officer", "incident_register", "efvp"] as const;
export const EXPOSURE_TIERS = ["low", "moderate", "high", "critical"] as const;
export const OFFER_TIERS = ["tier1", "tier2", "tier3"] as const;

export type HeadcountBand = (typeof HEADCOUNT_BANDS)[number];
export type Vertical = (typeof VERTICALS)[number];
export type AiStackItem = (typeof AI_STACK_ITEMS)[number];
export type ControlKey = (typeof CONTROL_KEYS)[number];
export type ExposureTier = (typeof EXPOSURE_TIERS)[number];
export type OfferTier = (typeof OFFER_TIERS)[number];

export interface ReadinessAnswers {
  headcount_band: HeadcountBand;
  vertical: Vertical;
  ai_stack: readonly AiStackItem[];
  controls: Readonly<Record<ControlKey, boolean>>;
}

const BASELINE_SCORE = 25;
const POINTS_PER_CONTROL = 25;
const AI_PENALTY_CAP = 25;
const LARGE_HEADCOUNT_PENALTY = 5;
const MIN_SCORE = 0;
const MAX_SCORE = 100;
const TIER2_MIN_SCORE = 50;
const TOP_FIX_COUNT = 3;

const AI_PENALTIES: Record<AiStackItem, number> = {
  copilot_chatgpt: 5,
  voice_ai: 10,
  custom_agents_rag: 15,
  exploring: 0,
};

const VERTICAL_PENALTIES: Record<Vertical, number> = {
  clinics_health: 10,
  accounting_legal: 8,
  retail_hospitality: 5,
  b2b_saas: 5,
  other: 3,
};

/** Lower bound (inclusive) of each exposure tier, checked from safest to riskiest. */
const EXPOSURE_THRESHOLDS: ReadonlyArray<readonly [ExposureTier, number]> = [
  ["low", 75],
  ["moderate", 50],
  ["high", 25],
  ["critical", MIN_SCORE],
];

export const CONTROL_FIX_IDS = {
  privacy_officer: "appoint_privacy_officer",
  incident_register: "open_incident_register",
  efvp: "run_efvp",
} as const satisfies Record<ControlKey, string>;

export const AI_FIX_IDS = {
  custom_agents_rag: "redteam_agents",
  voice_ai: "secure_voice_recordings",
  copilot_chatgpt: "govern_genai_use",
  exploring: "ai_policy_before_pilot",
} as const satisfies Record<AiStackItem, string>;

/** Used only when missing controls and AI fixes leave fewer than three items. */
export const FALLBACK_FIX_IDS = [
  "map_cross_border_transfers",
  "tabletop_incident_drill",
  "retention_schedule",
] as const;

export type FixId =
  | (typeof CONTROL_FIX_IDS)[ControlKey]
  | (typeof AI_FIX_IDS)[AiStackItem]
  | (typeof FALLBACK_FIX_IDS)[number];

/** AI fixes are listed from the highest-risk tool to the lowest. */
const AI_FIX_ORDER: readonly AiStackItem[] = ["custom_agents_rag", "voice_ai", "copilot_chatgpt", "exploring"];

function clampScore(value: number): number {
  return Math.min(MAX_SCORE, Math.max(MIN_SCORE, Math.round(value)));
}

function uniqueStack(stack: readonly AiStackItem[]): AiStackItem[] {
  return [...new Set(stack)];
}

export function computeAiPenalty(stack: readonly AiStackItem[]): number {
  const total = uniqueStack(stack).reduce((sum, item) => sum + AI_PENALTIES[item], 0);
  return Math.min(AI_PENALTY_CAP, total);
}

export function computeReadinessScore(answers: ReadinessAnswers): number {
  const controlsInPlace = CONTROL_KEYS.filter((key) => answers.controls[key]).length;
  const headcountPenalty = answers.headcount_band === "151-250+" ? LARGE_HEADCOUNT_PENALTY : 0;
  return clampScore(
    BASELINE_SCORE +
      POINTS_PER_CONTROL * controlsInPlace -
      computeAiPenalty(answers.ai_stack) -
      VERTICAL_PENALTIES[answers.vertical] -
      headcountPenalty,
  );
}

export function classifyExposure(score: number): ExposureTier {
  const match = EXPOSURE_THRESHOLDS.find(([, lowerBound]) => score >= lowerBound);
  return match ? match[0] : "critical";
}

/**
 * Qualification signal for the CRM (SPEC §7). On the page the hybrid audit stays the
 * entry point; tier2 is shown as the likely next step, never as a first purchase.
 */
export function recommendTier(answers: ReadinessAnswers, score: number): OfferTier {
  const stack = new Set(answers.ai_stack);
  const runsAgentsOrVoice = stack.has("custom_agents_rag") || stack.has("voice_ai");
  return runsAgentsOrVoice && score >= TIER2_MIN_SCORE ? "tier2" : "tier1";
}

export function selectTopFixes(answers: ReadinessAnswers): FixId[] {
  const missingControls: FixId[] = CONTROL_KEYS.filter((key) => !answers.controls[key]).map(
    (key) => CONTROL_FIX_IDS[key],
  );
  const stack = new Set(answers.ai_stack);
  const aiFixes: FixId[] = AI_FIX_ORDER.filter((item) => stack.has(item)).map((item) => AI_FIX_IDS[item]);
  return [...missingControls, ...aiFixes, ...FALLBACK_FIX_IDS].slice(0, TOP_FIX_COUNT);
}

export interface ReadinessAssessment {
  score: number;
  exposure_tier: ExposureTier;
  recommended_tier: OfferTier;
  fixes: FixId[];
}

export function assessReadiness(answers: ReadinessAnswers): ReadinessAssessment {
  const score = computeReadinessScore(answers);
  return {
    score,
    exposure_tier: classifyExposure(score),
    recommended_tier: recommendTier(answers, score),
    fixes: selectTopFixes(answers),
  };
}
