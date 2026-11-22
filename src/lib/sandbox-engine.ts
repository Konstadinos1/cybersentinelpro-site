/**
 * Deterministic guardrail engine for the threat sandbox (SPEC §8).
 * It runs in the browser: pattern rules, a tool-call allowlist and personal-information
 * detectors. No model is called; the same input always yields the same decision.
 */

export interface ToolCall {
  tool: string;
  args: Readonly<Record<string, string>>;
}

export interface AgentRequest {
  prompt: string;
  /** Text the agent retrieved (documents, tool descriptions); attackers hide instructions here. */
  retrieved: readonly string[];
  tool_calls: readonly ToolCall[];
}

export type RuleId = "CSP-PI-001" | "CSP-PII-002" | "CSP-TOOL-003";

export interface GuardDecision {
  verdict: "ALLOWED" | "BLOCKED";
  rule_id: RuleId | null;
  owasp_ref: string | null;
  reason: string | null;
  matched: string | null;
}

export interface GuardResult extends GuardDecision {
  latency_ms: number;
  logged: boolean;
}

/** Tools the demo agent is allowed to call. Anything else is excessive agency. */
export const TOOL_ALLOWLIST: ReadonlySet<string> = new Set(["search_documents", "create_ticket", "lookup_hours"]);
/** The only domain the demo agent may send data to. */
export const TRUSTED_DOMAIN = "groupe-exemple.ca";
const MATCH_PREVIEW_LENGTH = 80;
const LATENCY_DECIMALS = 3;

const INSTRUCTION_OVERRIDE_PATTERNS: readonly RegExp[] = [
  /\b(ignore[rsz]?|disregard|oublie[rsz]?)\b.{0,40}\b(instructions?|consignes?|r[eè]gles|rules)\b/i,
  /\b(reveal|print|show|repeat|dump|affiche[rsz]?|r[ée]v[eè]le[rsz]?|r[ée]p[eè]te[rsz]?)\b.{0,40}\b(system|syst[eè]me|hidden|cach[ée]e?s?|initial)\b.{0,20}\b(prompt|instructions?|message|consignes?)\b/i,
  /\b(developer mode|mode d[ée]veloppeur|jailbreak)\b/i,
];

const BULK_EXPORT_PATTERN =
  /\b(export(e[rsz]?)?|send|envoie[rsz]?|transf[eè]re[rsz]?|liste[rsz]?|list|dump)\b.{0,80}\b(clients?|patients?|dossiers?|records?|employ[ée]s?|NAS|SIN|assurance sociale|RAMQ)\b/i;
const EMAIL_PATTERN = /\b[\w.+-]+@([\w-]+(?:\.[\w-]+)+)\b/g;
const URL_PATTERN = /\bhttps?:\/\/([\w-]+(?:\.[\w-]+)+)/gi;
const SIN_PATTERN = /\b\d{3}[ -]?\d{3}[ -]?\d{3}\b/g;
const HEALTH_CARD_PATTERN = /\b[A-Z]{4}\s?\d{4}\s?\d{4}\b/;

const OWASP = {
  promptLeak: "LLM07:2025 System Prompt Leakage",
  disclosure: "LLM02:2025 Sensitive Information Disclosure",
  agency: "LLM06:2025 Excessive Agency",
} as const;

function preview(text: string): string {
  return text.length > MATCH_PREVIEW_LENGTH ? `${text.slice(0, MATCH_PREVIEW_LENGTH)}…` : text;
}

function isTrustedHost(host: string): boolean {
  const normalized = host.toLowerCase();
  return normalized === TRUSTED_DOMAIN || normalized.endsWith(`.${TRUSTED_DOMAIN}`);
}

function findExternalDestination(text: string): string | null {
  for (const pattern of [EMAIL_PATTERN, URL_PATTERN]) {
    for (const match of text.matchAll(pattern)) {
      const host = match[1];
      if (host && !isTrustedHost(host)) return match[0];
    }
  }
  return null;
}

/** Luhn check separates real-looking social insurance numbers from random digit runs. */
export function passesLuhn(digits: string): boolean {
  const values = digits.replace(/\D/g, "").split("").map(Number);
  const sum = values.reverse().reduce((total, digit, index) => {
    if (index % 2 === 0) return total + digit;
    const doubled = digit * 2;
    return total + (doubled > 9 ? doubled - 9 : doubled);
  }, 0);
  return values.length > 0 && sum % 10 === 0;
}

function containsPersonalIdentifier(text: string): string | null {
  for (const match of text.matchAll(SIN_PATTERN)) {
    if (passesLuhn(match[0])) return match[0];
  }
  return HEALTH_CARD_PATTERN.exec(text)?.[0] ?? null;
}

function block(rule_id: RuleId, owasp_ref: string, reason: string, matched: string): GuardDecision {
  return { verdict: "BLOCKED", rule_id, owasp_ref, reason, matched: preview(matched) };
}

function checkToolCalls(request: AgentRequest): GuardDecision | null {
  for (const call of request.tool_calls) {
    if (!TOOL_ALLOWLIST.has(call.tool)) {
      return block("CSP-TOOL-003", OWASP.agency, "tool_not_allowlisted", call.tool);
    }
    const destination = findExternalDestination(Object.values(call.args).join(" "));
    if (destination) return block("CSP-TOOL-003", OWASP.agency, "untrusted_destination", destination);
  }
  return null;
}

function checkPersonalInformation(request: AgentRequest): GuardDecision | null {
  const text = [request.prompt, ...request.retrieved].join("\n");
  const exportIntent = BULK_EXPORT_PATTERN.exec(text);
  const destination = findExternalDestination(text);
  if (exportIntent && destination) {
    return block("CSP-PII-002", OWASP.disclosure, "bulk_export_to_external_destination", exportIntent[0]);
  }
  const identifier = containsPersonalIdentifier(request.prompt);
  return identifier ? block("CSP-PII-002", OWASP.disclosure, "personal_identifier_in_prompt", identifier) : null;
}

function checkInstructionOverride(request: AgentRequest): GuardDecision | null {
  for (const text of [request.prompt, ...request.retrieved]) {
    for (const pattern of INSTRUCTION_OVERRIDE_PATTERNS) {
      const match = pattern.exec(text);
      if (match) return block("CSP-PI-001", OWASP.promptLeak, "instruction_override", match[0]);
    }
  }
  return null;
}

/** Tool misuse is checked first because it is the action with real-world side effects. */
export function evaluateAgentRequest(request: AgentRequest): GuardDecision {
  const decision =
    checkToolCalls(request) ?? checkPersonalInformation(request) ?? checkInstructionOverride(request);
  return decision ?? { verdict: "ALLOWED", rule_id: null, owasp_ref: null, reason: null, matched: null };
}

/** Wraps the decision with the measured latency and the audit-log flag shown in the sandbox. */
export function runGuardedRequest(request: AgentRequest, now: () => number = () => performance.now()): GuardResult {
  const startedAt = now();
  const decision = evaluateAgentRequest(request);
  const latency = now() - startedAt;
  return {
    ...decision,
    latency_ms: Number(latency.toFixed(LATENCY_DECIMALS)),
    logged: decision.verdict === "BLOCKED",
  };
}
