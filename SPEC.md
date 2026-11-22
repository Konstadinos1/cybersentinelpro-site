# SPEC — CyberSentinelPro flagship site (`cybersentinelpro.com`)

Status: **DRAFT, awaiting approval** (Phase 0). No application code is written until this is approved.

## 1. Goal

A bilingual (FR default, EN) marketing site and lead engine for Quebec B2B buyers (25–250 employees).
Every section leads to one of three conversions: the free Law 25 & AI diagnostic, the threat sandbox, or a booked audit call.

## 2. Fixed stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 App Router, React 19, TypeScript `strict` |
| Styling | Tailwind CSS v4 (CSS-first `@theme` tokens), Framer Motion for UI micro-motion |
| 3D | three, @react-three/fiber, @react-three/drei, @react-three/postprocessing, custom GLSL |
| Scroll | GSAP + ScrollTrigger, Lenis (disabled under reduced motion) |
| Data | Route Handlers, Zod, @supabase/supabase-js (server only), HMAC-signed `CRM_WEBHOOK_URL`, Resend stub |
| Fonts | `next/font/google`: Space Grotesk, Inter, JetBrains Mono (self-hosted at build, no runtime Google calls) |
| Tests | Playwright (headless Chromium) E2E script, `tsc --noEmit`, ESLint |
| Deploy | Vercel. Preview deploys only until the domain cut-over is approved |

## 3. Folder map

```
app/
  layout.tsx                     root <html> shell, fonts, no locale logic
  [locale]/layout.tsx            sets <html lang>, header, footer, consent banner, JSON-LD
  [locale]/page.tsx              home: hero, calculator, sandbox, offers, moat, partners
  [locale]/privacy/page.tsx      served as /en/privacy and /fr/confidentialite (rewrite)
  api/leads/route.ts             POST only, Zod, Supabase insert, webhook dispatch
  sitemap.ts  robots.ts  not-found.tsx
middleware.ts                    / -> /fr or /en from Accept-Language + cookie; /fr/confidentialite rewrite
src/
  i18n/{config.ts, dictionaries/fr.ts, dictionaries/en.ts, get-dictionary.ts}
  components/hud/                Header, LocaleSwitch, AudioToggle, CipherText, TrustBar, Footer
  components/sections/           Hero, Calculator/*, Sandbox/*, OfferLadder, MoatMatrix, PartnerTrack, PartnerDrawer
  components/consent/            ConsentBanner, ConsentProvider
  scene/                         Canvas root, SentinelCore, ServiceMonoliths, FirewallPlane, ParticleLattice,
                                 shaders/*.glsl.ts, quality/{AdaptiveQuality.tsx, capability.ts}
  lib/{scoring.ts, sandbox-engine.ts, track-event.ts, webhook.ts, supabase-server.ts, lead-schema.ts, audio.ts, env.ts}
supabase/migrations/001_leads.sql
e2e/verify.spec.ts               the Phase 3 assertion script
qa-screenshots/                  output, git-ignored except README
.claude/{settings.json, hooks/*, rules/*, plans/build-plan.md}
```

## 4. i18n routing

- Locales `fr` (default) and `en`. Dictionaries are typed TS objects; `en.ts` must satisfy `typeof fr` so a missing key fails `tsc`.
- `/` redirects (307) by cookie `csp_locale`, then `Accept-Language`, then `fr`.
- Localised slugs: `/fr/confidentialite` and `/en/privacy`. Section anchors are the same in both languages (`#diagnostic`, `#sandbox`, `#solutions`, `#partners`).
- The `FR | EN` switch maps the current path to its twin (privacy slug included), keeps the hash, sets the cookie, and swaps without a full reload.
- Each page emits `hreflang` alternates (`fr-CA`, `en-CA`, `x-default` -> `/fr`).
- French copy is written as Quebec business French, not translated afterwards (courriel, témoin, rendez-vous, ÉFVP). Bill 96: French is never less prominent than English.

## 5. Page sections and content rules

1. **HUD header**: wordmark, 4 links (Solutions, Threat Sandbox, Law 25 Diagnostic, Partners), `FR | EN`, `AUDIO: OFF/ON`, CTA `Score de risque gratuit / Free Risk Score` -> `#diagnostic`. Telemetry line `SYS.STATUS // LAW25.READY // LAVAL.QC`.
2. **Hero**: headline, subheadline and dual CTA exactly as in the brief. Trust bar: `OWASP LLM Top 10 | Quebec Law 25 | Agentic Runtime Defense | Bilingual Laval / Greater Montreal`.
3. **Calculator**: 5 steps (section 7). Output: animated 0–100 score, exposure tier, top 3 fixes, recommended tier, Cal.com trigger, deep-audit link.
4. **Sandbox**: 3 presets (section 8).
5. **Offer ladder**: the 3 CAD tiers with the prices and durations from the brief. The audit tier repeats the non-legal disclaimer.
6. **Moat matrix**: CyberSentinelPro vs Compliance Checklist SaaS vs Generalist MSPs vs Big 4 across Speed, Live AI Red-Teaming, Bilingual Law 25 Fit, Direct Principal Access, Fixed Pricing. Category comparisons only; no named competitors.
7. **Partner track**: section + slide-over drawer form (source `partner`).
8. **Footer**: non-legal disclaimer, privacy link, privacy-officer contact, Laval address line, consent settings link.

Copy guardrails: never mention or imply CISSP, CIPP, CPA (as a credential) or Barreau du Québec / legal counsel. No Lorem Ipsum, no `href="#"`, every CTA resolves to an anchor, a drawer, or a real URL.
Disclaimer text: "CyberSentinelPro fournit des services d'ingénierie en cybersécurité et en conformité opérationnelle, et non des avis juridiques." / "CyberSentinelPro delivers technical cybersecurity and operational compliance engineering, not legal advice."

## 6. 3D scene and performance budget

| Item | Budget |
|---|---|
| First paint | Server-rendered dark-glass hero shell (CSS gradients + inline SVG facets). The headline is the LCP element, never the canvas |
| LCP / CLS / INP | < 2.5 s (Moto G-class throttle), < 0.05, < 200 ms |
| Initial JS (home, excluding 3D chunk) | < 190 KB gzip |
| 3D chunk | `next/dynamic` with `ssr:false`, loaded after `requestIdleCallback`; < 350 KB gzip |
| DPR | `dpr={[1, 1.75]}` |
| Frame rate | Target 60. `PerformanceMonitor` drops a tier after 2 s below 45 FPS |
| Draw calls | < 60 per frame; one instanced mesh per particle field |
| Particles | Tier high 6 000, mid 2 500, low 0 (static) |
| Assets | 100 % procedural. No `.glb`, no textures over 64 KB |

Quality tiers: `high` (bloom + chromatic aberration + refraction) -> `mid` (no postprocessing, half particles) -> `static`.
`static` is chosen up front when `prefers-reduced-motion: reduce`, `navigator.connection.saveData`, `deviceMemory <= 4` on touch devices, or no WebGL2. It renders the high-contrast SVG/CSS layer and no `<canvas>`.

Scenes (all procedural):
1. **Sentinel Core** (hero): faceted icosahedral monolith, custom Fresnel rim shader, `MeshTransmissionMaterial`-style refraction on `high` only, velocity-based chromatic shift, pointer-reactive instanced particle lattice.
2. **Service Monoliths** (offer ladder): 3 translucent chambers; ScrollTrigger scrubs the camera between them in sync with the 3 tier cards.
3. **Firewall Plane** (sandbox): node stream; a payload packet hits a crystalline plane and deflects. It replays when a sandbox preset runs.

Audio: Web Audio API only, off by default, created on first user click. Ambient drone (2 detuned sine oscillators + low-pass) and a glass click (short filtered noise burst). Preference kept in `localStorage`.

## 7. Calculator scoring (deterministic, client and server share `lib/scoring.ts`)

Inputs: headcount `25-50|51-150|151-250+`, vertical, AI stack (multi-select), controls (privacy officer, incident register, ÉFVP/PIA, each yes/no).

```
score = 25 (baseline)
      + 25 per control in place                     (max 75)
      - AI penalty: Copilot/ChatGPT 5, Voice AI 10, Custom agents/RAG 15, Exploring 0   (sum, capped at 25)
      - vertical: Clinics/Health 10, Accounting/Legal 8, Retail/QSR 5, B2B SaaS 5, Other 3
      - headcount 151-250+: 5
clamped to 0..100, integer
```

Exposure tier: `>= 75 Faible / Low`, `50–74 Modérée / Moderate`, `25–49 Élevée / High`, `< 25 Critique / Critical`.
Statutory context shown with each tier: administrative monetary penalties up to $10M or 2 % of worldwide turnover; penal fines up to $25M or 4 %.
Top 3 fixes: missing controls first (in the order privacy officer, register, ÉFVP), then AI-specific fixes for the selected stack.
Recommended tier: Tier 2 if Custom agents/RAG or Voice AI is selected and score >= 50; otherwise Tier 1. Tier 3 is offered as the follow-on.
The server recomputes the score; a client-sent score is ignored.

## 8. Threat sandbox (deterministic, no LLM call)

- "Unprotected model" output is a scripted fixture per preset (clearly labelled *simulation*).
- "Guardrailed runtime" output comes from `lib/sandbox-engine.ts`, a real TS rule engine run in the browser (pattern rules + tool-call allowlist + PII detectors). Latency shown is `performance.now()` around that call.
- Presets: `prompt_extraction`, `law25_pii_exfil`, `mcp_tool_hijack`. Each yields `{verdict:'BREACH'}` on the left and `{verdict:'BLOCKED', rule_id, owasp_ref, latency_ms, logged:true}` on the right, with expandable audit JSON.
- A fourth preset, `routine_ticket`, sends an ordinary employee request through the same guard: `NO BREACH` on the left, `{verdict:'ALLOWED', rule_id:null, logged:false}` on the right. It shows that legitimate work passes (Business Plan, 11 Nov 2026). The firewall scene replays only for attacks.
- Secret-shaped strings in fixtures are assembled from fragments at runtime. Attacker text is rendered as text only (no `dangerouslySetInnerHTML`).

## 9. Data: Supabase `leads`

```sql
create table public.leads (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  source           text not null check (source in ('calculator','partner')),
  locale           text not null check (locale in ('fr','en')),
  full_name        text not null check (char_length(full_name) between 2 and 120),
  work_email       text not null check (char_length(work_email) <= 254),
  company          text not null check (char_length(company) between 2 and 160),
  headcount_band   text check (headcount_band in ('25-50','51-150','151-250+')),
  vertical         text,
  ai_stack         text[] not null default '{}',
  controls         jsonb not null default '{}'::jsonb,
  score            smallint check (score between 0 and 100),
  exposure_tier    text check (exposure_tier in ('low','moderate','high','critical')),
  recommended_tier text check (recommended_tier in ('tier1','tier2','tier3')),
  partner_type     text check (partner_type in ('accounting_firm','msp','fractional_cto','privacy_counsel','other')),
  message          text check (char_length(message) <= 2000),
  consent_contact  boolean not null,
  consent_marketing boolean not null default false,
  consent_at       timestamptz not null,
  utm              jsonb not null default '{}'::jsonb,
  webhook_status   text not null default 'pending' check (webhook_status in ('pending','sent','failed','skipped'))
);
alter table public.leads enable row level security;   -- no policies: anon/auth roles cannot read or write
create index leads_created_at_idx on public.leads (created_at desc);
```

Inserts use the service-role key on the server only. No IP address is stored. Retention: delete after 24 months (documented on the privacy page; enforcement job is out of scope for v1).

## 10. `/api/leads` contract

- `POST` JSON, max 8 KB, `Content-Type: application/json`. Zod schema `.strict()` (unknown fields -> 400). Honeypot field `website` must be empty.
- Discriminated union on `source`. `consent_contact` must be `true`.
- Responses: `201 {ok:true, id, score?, exposure_tier?, recommended_tier?}`, `400 {ok:false, error:'validation', issues}`, `413`, `415`, `429` (in-memory limiter, 5/min/IP, best effort on serverless), `500 {ok:false, error:'storage'}`.
- Without `SUPABASE_URL` the route runs in **mock mode**: validates, returns 201 with `mock:true`, logs nothing personal. This is what E2E uses.

## 11. Webhook contract (n8n / GoHighLevel)

`POST CRM_WEBHOOK_URL`, after a successful insert, 3 s timeout, 1 retry, failure recorded in `webhook_status` and never surfaced to the visitor.

Headers: `Content-Type: application/json`, `X-CSP-Timestamp: <unix seconds>`, `X-CSP-Signature: sha256=<hex HMAC-SHA256(CRM_WEBHOOK_SECRET, timestamp + "." + rawBody)>`.
Body:
```json
{ "event": "lead.created", "version": 1, "lead_id": "uuid", "created_at": "ISO-8601",
  "source": "calculator", "locale": "fr",
  "contact": { "full_name": "", "work_email": "", "company": "" },
  "qualification": { "headcount_band": "", "vertical": "", "ai_stack": [], "controls": {},
                     "score": 0, "exposure_tier": "", "recommended_tier": "" },
  "partner": null, "consent": { "contact": true, "marketing": false, "at": "ISO-8601" }, "utm": {} }
```
Receivers reject timestamps older than 5 minutes. Resend is a stub (`lib/email.ts`) that no-ops unless `RESEND_API_KEY` is set.

## 12. Consent and analytics (Law 25)

- Banner on first visit with equal-weight `Accepter / Refuser` and a settings link; nothing is pre-checked. Choice stored in a first-party `csp_consent` cookie (12 months) with a version number.
- `trackEvent(name, props)` is typed against an event union and is a no-op until `analytics === true`. The analytics script tag is injected only after opt-in.
- Cal.com embed loads only when the visitor clicks "Book", with a notice that it is a third party.
- Privacy pages list: purposes, data collected, Supabase/Vercel/Cal.com/CRM as processors and where they host, retention, rights (access, rectification, withdrawal), privacy-officer contact.

## 13. SEO

`metadata` per locale, `sitemap.ts` (4 URLs + alternates), `robots.ts`, JSON-LD `ProfessionalService` (name, url, areaServed Laval / Greater Montreal, address locality Laval QC, `knowsLanguage` fr/en, `makesOffer` for the 3 tiers in CAD). No credential fields.

## 14. Environment variables (`.env.example`)

`NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_DEEP_AUDIT_URL` (CTA hidden when unset), `NEXT_PUBLIC_CALCOM_LINK`, `NEXT_PUBLIC_ANALYTICS_PROVIDER` (`none|vercel|plausible`), `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `CRM_WEBHOOK_URL`, `CRM_WEBHOOK_SECRET`, `RESEND_API_KEY`, `LEAD_NOTIFY_EMAIL`, `NEXT_PUBLIC_PRIVACY_OFFICER_EMAIL`.

## 15. Pass/fail verification (all must pass; exit codes reported)

| # | Check | Pass when |
|---|---|---|
| V1 | `npx tsc --noEmit` | exit 0 |
| V2 | `npm run lint` | exit 0, zero warnings |
| V3 | `npm run build` | exit 0; home first-load JS < 190 KB gzip |
| V4 | Guardrail scan | `scripts/guard-scan.mjs` finds 0 forbidden credential strings and 0 `href="#"` in `src/`, `app/`, `public/` |
| E1 | Console / errors / overflow | 0 console errors, 0 `pageerror`, `scrollWidth <= innerWidth` on every route at 1440×900 and 390×844 |
| E2 | WebGL | `canvas[data-scene="sentinel"]` mounts with a WebGL context; with `reducedMotion:'reduce'` no canvas exists and `[data-hero-static]` is visible |
| E3 | Locale switch | FR->EN->FR changes nav labels, hero H1, calculator step 1 label, and maps `/fr/confidentialite` <-> `/en/privacy` |
| E4 | Calculator | A fixed answer set yields the expected score (unit-tested value), score is 0–100, POST `/api/leads` returns 201; an invalid email returns 400 and shows the inline error |
| E5 | Sandbox | Each of the 3 attack presets shows `BREACH DETECTED` left and `BLOCKED + LOGGED` right; the routine preset shows `NO BREACH` and `ALLOWED`; every audit JSON parses and lists the 3 rules evaluated |
| E6 | Consent | Before opt-in: no request to the analytics host and `trackEvent` calls are dropped. After Refuser: still none. After Accepter: the analytics script loads |
| E7 | Dead CTAs | Every `a[href]` and `button` on the home page resolves to an existing id, a drawer, or a URL returning < 400 |

Screenshots: `qa-screenshots/{desktop,mobile}-{fr,en}-{section}.png` plus error and edge states (invalid email, API 500, reduced motion, consent banner). A short video of the main flow (land -> diagnostic -> score -> sandbox -> book) is recorded with Playwright `recordVideo`.
