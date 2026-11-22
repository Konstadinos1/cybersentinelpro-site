# Build plan

Each phase ends with a commit on the working branch and a pushed checkpoint, so any phase can be rewound.
Order matters: B and C depend on A's routing, tokens and dictionary shape, so A runs first and B/C run in parallel after it.

## Phase 0 — Contract (this commit)
- SPEC.md, this plan, lean CLAUDE.md, `.claude/rules/{webgl-performance,quebec-compliance}.md`.
- Gate: Konsta approves SPEC.md and the repo location.

## Phase 1 — Hooks and quality gates
- Remove the legacy single-file quiz from the root (kept in git history; its question set informs the calculator copy).
- `npx create-next-app@15` equivalent scaffold by hand (no template cruft), Tailwind v4, ESLint flat config, Playwright.
- `.claude/settings.json`:
  - `PostToolUse` (Write|Edit on `*.ts`/`*.tsx`): `.claude/hooks/post-edit-check.sh` runs Prettier on the file, then `tsc --noEmit` (incremental) and prints errors back.
  - `PreToolUse` (Read|Edit|Write|Bash): `.claude/hooks/pre-guard.mjs` denies any path matching `.env.local`/`.env*.local`, any `git add`/`commit` that stages them, and any write whose new text contains a forbidden credential string. The forbidden list is assembled from fragments inside the script so the guard never blocks itself, and `SPEC.md`, `CLAUDE.md`, `AGENTS.md` and `.claude/rules/` are exempt because they must name the banned terms.
  - `Stop`: `.claude/hooks/stop-gate.sh` runs `npx tsc --noEmit && npm run lint && npm run build` and blocks completion (exit 2) on any failure.
- `scripts/guard-scan.mjs` (V4) wired into `npm run check`.
- Commit: `chore: scaffold Next.js 15 app with deterministic quality gates`.

## Phase 2 — Parallel tracks (subagents, file ownership enforced)
| Agent | Owns | Delivers |
|---|---|---|
| A `foundation-i18n` (runs first) | `app/`, `middleware.ts`, `src/i18n/`, `src/components/hud/`, `src/components/consent/`, `src/lib/track-event.ts` | routing, fonts, tokens, dictionaries, header/footer, consent gate, privacy pages, SEO files |
| B `webgl-shader-engineer` | `src/scene/`, `src/lib/audio.ts` | 3 procedural scenes, shaders, adaptive quality, static fallback, audio |
| C `funnel-backend-engineer` | `src/components/sections/`, `app/api/`, `src/lib/{scoring,sandbox-engine,webhook,lead-schema,supabase-server,email,env}.ts`, `supabase/` | calculator, sandbox, offers, moat, partners, API, migration, unit tests |
| D `qa-code-reviewer` (after A–C) | read-only | diff audit: credentials, Quebec French, bundle weight, hydration, dead CTAs |
- Commits: one per track (`feat(i18n): ...`, `feat(scene): ...`, `feat(funnel): ...`), then `fix: ...` for D's findings.

## Phase 3 — Browser verification
- `npm run build && npm start` in the background; `e2e/verify.spec.ts` runs E1–E7 from SPEC §15 at 1440×900 and 390×844, FR and EN.
- Screenshots to `qa-screenshots/`, video of the main flow, self-review of every capture with issues logged.
- Commit: `test: add end-to-end verification and QA captures`.

## Phase 4 — Deploy prep (no production change without approval)
- README with WSL2 run steps and Vercel steps, `.env.example`, Vercel preview deploy from the branch.
- Domain cut-over for cybersentinelpro.com only after explicit approval.
