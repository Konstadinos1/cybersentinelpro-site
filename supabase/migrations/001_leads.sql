-- Leads captured by the diagnostic and the partner drawer (SPEC §9).
-- Create the project in ca-central-1 (Canada) to match the privacy page.
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

-- No policies: the anon and authenticated roles can neither read nor write.
-- Inserts come only from the server with the service-role key.
alter table public.leads enable row level security;

create index leads_created_at_idx on public.leads (created_at desc);

-- Retention: 24 months (privacy page). Enforcement job is out of scope for v1.
comment on table public.leads is 'Lead intake. Retain 24 months, then delete.';
