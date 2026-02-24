-- PART 12 security hardening baseline
-- Enable RLS on tenant-sensitive tables and add reusable membership function.

create or replace function public.user_can_access_business(p_business_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.businesses b
    where b.id = p_business_id
      and (
        b.owner_id = auth.uid()
        or b.owner_user_id = auth.uid()
      )
  );
$$;

alter table if exists public.businesses enable row level security;
alter table if exists public.widgets enable row level security;
alter table if exists public.templates enable row level security;
alter table if exists public.messages enable row level security;
alter table if exists public.conversations enable row level security;
alter table if exists public.contacts enable row level security;
alter table if exists public.analytics enable row level security;

-- Core read/write policies (idempotent style via IF NOT EXISTS not available for policy name in all PG versions)
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='templates' and policyname='templates_tenant_access'
  ) then
    create policy templates_tenant_access on public.templates
      for all
      using (public.user_can_access_business(business_id))
      with check (public.user_can_access_business(business_id));
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='contacts' and policyname='contacts_tenant_access'
  ) then
    create policy contacts_tenant_access on public.contacts
      for all
      using (public.user_can_access_business(business_id))
      with check (public.user_can_access_business(business_id));
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='messages' and policyname='messages_tenant_access'
  ) then
    create policy messages_tenant_access on public.messages
      for all
      using (public.user_can_access_business(business_id))
      with check (public.user_can_access_business(business_id));
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='conversations' and policyname='conversations_tenant_access'
  ) then
    create policy conversations_tenant_access on public.conversations
      for all
      using (public.user_can_access_business(business_id))
      with check (public.user_can_access_business(business_id));
  end if;
end $$;
