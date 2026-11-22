#!/usr/bin/env node
/**
 * PreToolUse guard (Read|Edit|Write|Bash). Denies access to local env files, staging them in
 * git, and writes that add a forbidden credential string. SPEC.md, CLAUDE.md, AGENTS.md and
 * .claude/rules/ are exempt because they must name the banned terms.
 */
import { readFileSync } from "node:fs";
import { findForbidden } from "../../scripts/forbidden-terms.mjs";

const LOCAL_ENV = /(^|\/)\.env(\.[\w-]+)?\.local$/;
const EXEMPT = [/(^|\/)SPEC\.md$/, /(^|\/)CLAUDE\.md$/, /(^|\/)AGENTS\.md$/, /(^|\/)\.claude\/rules\//, /(^|\/)scripts\/forbidden-terms\.mjs$/];

function deny(reason) {
  process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: "PreToolUse", permissionDecision: "deny", permissionDecisionReason: reason } }));
  process.exit(0);
}

const input = JSON.parse(readFileSync(0, "utf8") || "{}");
const tool = input.tool_name ?? "";
const args = input.tool_input ?? {};
const path = String(args.file_path ?? args.path ?? "");

if (path && LOCAL_ENV.test(path)) deny("Local env files hold secrets and are never read or edited by agents.");

if (tool === "Bash") {
  const command = String(args.command ?? "");
  if (/\.env[\w.-]*\.local/.test(command)) deny("Commands that touch .env*.local are blocked.");
}

if ((tool === "Write" || tool === "Edit") && !EXEMPT.some((pattern) => pattern.test(path))) {
  const text = String(args.content ?? args.new_string ?? "");
  const hits = findForbidden(text);
  if (hits.length > 0) deny(`Blocked: new text matches forbidden patterns (${hits.join(", ")}). See .claude/rules/quebec-compliance.md.`);
}
process.exit(0);
