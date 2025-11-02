-- Day 5: Plan logic + monthly quota counters (idempotent)

-- 1) Business plan columns (soft-add; ignore if already present)
alter table if exists businesses add column if not exists plan text default 'free';
alter table if exists businesses add column if not exists subscription_status text;
alter table if exists businesses add column if not exists razorpay_subscription_id text;
alter table if exists businesses add column if not exists razorpay_customer_id text;

-- 2) Monthly usage counters (by widget, period, kind)
create table if not exists usage_counters (
  widget_id uuid not null references widgets(id) on delete cascade,
  period    text not null,                      -- 'YYYYMM'
  kind      text not null default 'message',
  count     integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (widget_id, period, kind)
);

create index if not exists usage_counters_widget_idx on usage_counters (widget_id);
create index if not exists usage_counters_period_idx on usage_counters (period);

-- 3) Atomic increment helper
drop function if exists inc_usage(uuid, text, text);
create or replace function inc_usage(p_widget_id uuid, p_period text, p_kind text default 'message')
returns integer
language sql
as $$
  insert into usage_counters(widget_id, period, kind, count)
  values (p_widget_id, p_period, p_kind, 1)
  on conflict (widget_id, period, kind)
  do update set count = usage_counters.count + 1, updated_at = now()
  returning usage_counters.count;
$$;