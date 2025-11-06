-- ================================================
-- business_triggers - per-business custom triggers
-- ================================================
-- NOTE: Apply this in Supabase SQL editor or CLI to take effect.
-- Safe & additive, does not break existing features.

create table if not exists public.business_triggers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null,
  code text not null check (code ~ '^[a-z0-9_]{3,30}$'),
  label text not null,
  type text not null check (type in ('manual','url_param','utm','path_match')),
  matchers jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists business_triggers_business_code_key
  on public.business_triggers (business_id, code);

create index if not exists business_triggers_business_active_idx
  on public.business_triggers (business_id, active);

comment on table public.business_triggers is
  'Custom triggers defined by businesses; managed at /dashboard/templates/triggers.';

-- Optional: updated_at trigger (only if not already present)
do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'business_triggers_set_updated_at'
  ) then
    create or replace function public.set_updated_at()
    returns trigger language plpgsql as $f$
    begin
      new.updated_at := now();
      return new;
    end;
    $f$;

    create trigger business_triggers_set_updated_at
      before update on public.business_triggers
      for each row execute procedure public.set_updated_at();
  end if;
end $$;