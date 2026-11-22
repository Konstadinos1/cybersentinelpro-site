# CyberSentinelPro — cybersentinelpro.com

Bilingual (French default, English) marketing site and lead engine for CyberSentinelPro:
Law 25 and AI security audits for Quebec companies with 25 to 250 employees.

The contract is [`SPEC.md`](SPEC.md); project rules are in [`CLAUDE.md`](CLAUDE.md) and `.claude/rules/`.
Offer, prices and positioning follow the *CyberSentinelPro 18-Month Business Strategy Plan* (22 Nov 2026).
All prices live in `src/i18n/dictionaries/{fr,en}.ts` (`offers.tiers`) and `src/components/JsonLd.tsx`.

## What is on the page

| Section | What it does |
|---|---|
| Hero | Headline, two CTAs, procedural 3D "Sentinel Core" (static SVG fallback) |
| Diagnostic | 5-step Law 25 + AI score (0–100), exposure tier, top 3 fixes, booking |
| Threat sandbox | 3 attacks: scripted unprotected answer vs a real rule engine in the browser |
| Offers | T1 audit, T2 deployment, T3 retainer, with the camera scrubbing 3 monoliths |
| Comparison | Category comparison, no competitor named |
| Partners | 4 partner types and a slide-over form |

## Run it (WSL2 / Ubuntu)

```bash
nvm use 22            # Node 20+ works
npm ci
cp .env.example .env.local   # optional; mock mode without Supabase
npm run dev           # http://localhost:3000 -> redirects to /fr or /en
```

Checks:

```bash
npm run check         # tsc --noEmit, eslint (0 warnings), guard scan, unit tests
npm run build         # production build; home first-load JS must stay < 190 KB gzip
npx playwright install chromium   # once, or set CHROME_PATH=/path/to/chrome
npm run e2e           # SPEC §15 E1–E7 at 1440x900 and 390x844, FR and EN -> qa-screenshots/
```

`npm run e2e` builds nothing; run `npm run build` first. To test a deployed preview:
`E2E_BASE_URL=https://<preview>.vercel.app E2E_BYPASS=<protection-bypass-secret> npm run e2e`.

## Leads

`POST /api/leads` validates with Zod (`.strict()`), recomputes the score on the server, inserts into
Supabase with the service-role key, then calls the CRM webhook after the response is sent.

1. Create a Supabase project in **ca-central-1 (Canada)** — the privacy page says so.
2. Run `supabase/migrations/001_leads.sql`. RLS is on with no policies: only the server key can write.
3. Set `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `CRM_WEBHOOK_URL`, `CRM_WEBHOOK_SECRET` in Vercel.

Webhook receivers must verify `X-CSP-Signature: sha256=HMAC(secret, X-CSP-Timestamp + "." + rawBody)`
and reject timestamps older than 5 minutes.

## Deploy (Vercel)

- Framework preset: Next.js. Build command `npm run build`. Node 22.
- Preview deploys only until the owner approves the cut-over to `cybersentinelpro.com`.
- Set the `NEXT_PUBLIC_*` values per environment; they are baked in at build time.

## Before going public

- The privacy officer mailbox in `NEXT_PUBLIC_PRIVACY_OFFICER_EMAIL` must exist.
- Confirm the vendor list on the privacy page (Vercel, Supabase Canada, GoHighLevel, Cal.com) matches reality,
  and complete the Law 25 assessment for vendors that host data outside Quebec.
- Review the French copy and every price with the owner.

## Quality tiers (3D)

`high` (bloom, chromatic aberration, glass shell, 6,000 particles) → `mid` (no post-processing, 2,500)
→ `static` (no canvas). Reduced motion, Save-Data, low-memory touch devices and no WebGL2 start on
`static`. Two seconds under 45 FPS drops one tier; it never climbs back in a session.
