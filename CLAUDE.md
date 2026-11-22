# CyberSentinelPro site — Project Constitution

The full contract is `SPEC.md`. The phase plan is `.claude/plans/build-plan.md`.
Scoped rules: `.claude/rules/webgl-performance.md`, `.claude/rules/quebec-compliance.md`.
`AGENTS.md` is identical to this file; change both together.

## What this is
Bilingual (FR default, EN) marketing site and lead engine for cybersentinelpro.com.
Next.js 15 App Router, React 19, TypeScript strict, Tailwind v4, R3F + custom GLSL, Supabase, Vercel.

## Non-negotiables
1. Never mention or imply the credentials listed as forbidden in `quebec-compliance.md`,
   in code, copy, metadata, alt text or schema. Authority comes from demonstrable tooling.
2. The non-legal disclaimer appears in the footer and in the audit tier.
3. French is written as Quebec business French and is never less prominent than English.
4. Every dictionary key exists in both `fr.ts` and `en.ts`; `en` is typed as `typeof fr`.
5. No analytics, third-party script or tracking call before explicit opt-in.
6. No placeholder content, no `href="#"`, no empty cards, no dead CTA.
7. Secrets come from the environment only. Never read or commit `.env.local`.
8. Attacker-controlled text (sandbox) renders as text only.
9. The score is computed by `src/lib/scoring.ts`; the server recomputes it and ignores the client's value.
10. No LLM call anywhere in a decision path. The sandbox guard is deterministic.

## Code rules
- Functions do one thing and stay under 40 lines.
- No magic numbers: constants at the top of the module or in config.
- Names say what they do: `computeReadinessScore()`, not `calc()`.
- Handle errors deliberately; never swallow an exception.
- Comments explain why, not what.
- Validate every external input with Zod `.strict()` schemas.

## Commands
```bash
npm run dev          # local dev on :3000
npm run check        # tsc --noEmit, lint, guard-scan, unit tests
npm run build        # production build
npm run e2e          # Playwright verification (SPEC §15); writes qa-screenshots/
```

## Done means
`npx tsc --noEmit`, `npm run lint` and `npm run build` exit 0 (the Stop hook enforces it),
the E2E checks in SPEC §15 pass, and screenshots are reviewed. Report results as they are.

## Git
- Conventional commits, one logical change per commit, commit at every milestone.
- Never push to `main`; open a pull request.
- No production deploy or domain change without the owner's explicit approval.
