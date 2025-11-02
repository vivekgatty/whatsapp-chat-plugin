-- Analytics helpers (safe to re-run)

-- Efficient indexes (no-ops if already exist)
create index if not exists analytics_widget_created_idx on analytics(widget_id, created_at);
create index if not exists analytics_widget_page_idx    on analytics(widget_id, page);

-- Daily rollup: last N days (default 14)
drop function if exists daily_analytics(uuid, int);
create or replace function daily_analytics(p_widget_id uuid, p_days int default 14)
returns table(day date, impressions int, opens int, closes int, clicks int, leads int)
language sql
as $$
  select
    date_trunc('day', created_at)::date as day,
    sum((event_type = 'impression')::int) as impressions,
    sum((event_type = 'open')::int)       as opens,
    sum((event_type = 'close')::int)      as closes,
    sum((event_type = 'click')::int)      as clicks,
    sum((event_type = 'lead')::int)       as leads
  from analytics
  where widget_id = p_widget_id
    and created_at >= now() - make_interval(days => p_days)
  group by 1
  order by 1 asc;
$$;

-- By-page rollup: last N days (default 14)
drop function if exists page_analytics(uuid, int);
create or replace function page_analytics(p_widget_id uuid, p_days int default 14)
returns table(page text, impressions int, opens int, closes int, clicks int, leads int)
language sql
as $$
  select
    coalesce(page, '(unknown)') as page,
    sum((event_type = 'impression')::int) as impressions,
    sum((event_type = 'open')::int)       as opens,
    sum((event_type = 'close')::int)      as closes,
    sum((event_type = 'click')::int)      as clicks,
    sum((event_type = 'lead')::int)       as leads
  from analytics
  where widget_id = p_widget_id
    and created_at >= now() - make_interval(days => p_days)
  group by 1
  order by 1 desc;
$$;