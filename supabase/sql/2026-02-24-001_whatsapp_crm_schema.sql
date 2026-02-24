-- ============================================================
-- WhatsApp CRM Platform Schema (ChatMadi pivot foundation)
-- ============================================================
-- NOTE:
-- - Apply this in Supabase SQL editor (or via CLI) in one go.
-- - Designed to be SAFE & ADDITIVE (uses IF NOT EXISTS / guarded DDL where possible).
-- - Does NOT remove or alter existing widget/auth/billing tables.
--
-- Required extensions: uuid-ossp, pg_cron, pgcrypto, pgvector

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_cron";
create extension if not exists "pgcrypto";
create extension if not exists "vector";

-- ============================================================
-- Helper functions
-- ============================================================

-- Auto-update updated_at timestamps (do not conflict with existing set_updated_at())
create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- WORKSPACES (Multi-tenant root entity)
-- ============================================================
create table if not exists public.workspaces (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  slug text unique not null,
  industry text,
  business_size text default 'small',
  timezone text default 'Asia/Kolkata',
  language text default 'en',
  logo_url text,
  website text,
  address text,
  city text,
  country text default 'IN',
  plan text default 'trial',
  trial_ends_at timestamptz default now() + interval '14 days',
  stripe_customer_id text,
  razorpay_customer_id text,
  razorpay_subscription_id text,
  subscription_status text default 'trialing',
  monthly_conversation_limit int default 1000,
  conversations_used_this_month int default 0,
  usage_reset_at timestamptz default date_trunc('month', now()) + interval '1 month',
  is_active boolean default true,
  onboarding_completed boolean default false,
  onboarding_step text default 'meta_connect',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- WHATSAPP CONNECTIONS
-- ============================================================
create table if not exists public.whatsapp_connections (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid references public.workspaces(id) on delete cascade not null unique,
  phone_number_id text not null,
  phone_number text not null,
  display_phone_number text,
  waba_id text not null,
  business_name text,
  access_token text not null,
  token_expires_at timestamptz,
  webhook_verified boolean default false,
  quality_rating text default 'GREEN',
  messaging_limit text default 'TIER_1K',
  status text default 'pending',
  connected_at timestamptz default now(),
  last_health_check_at timestamptz,
  meta_embedded_signup_data jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- AGENTS
-- ============================================================
create table if not exists public.agents (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid references public.workspaces(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  display_name text not null,
  email text not null,
  avatar_url text,
  role text default 'agent',
  is_online boolean default false,
  last_seen_at timestamptz,
  notification_preferences jsonb default '{"new_message": true, "assigned": true, "mentioned": true, "daily_summary": true}'::jsonb,
  working_hours jsonb,
  is_active boolean default true,
  invited_by uuid references auth.users(id),
  invitation_accepted_at timestamptz,
  created_at timestamptz default now(),
  unique(workspace_id, user_id)
);

-- Workspace membership helper (used by RLS)
-- Defined AFTER workspaces + agents so it can be created cleanly.
create or replace function public.is_workspace_member(p_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    exists (
      select 1
      from public.workspaces w
      where w.id = p_workspace_id
        and w.owner_id = auth.uid()
        and w.is_active = true
    )
    or exists (
      select 1
      from public.agents a
      where a.workspace_id = p_workspace_id
        and a.user_id = auth.uid()
        and a.is_active = true
    );
$$;

-- ============================================================
-- CONTACTS
-- ============================================================
create table if not exists public.contacts (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid references public.workspaces(id) on delete cascade not null,
  wa_id text not null,
  name text,
  profile_name text,
  phone text,
  email text,
  avatar_url text,

  status text default 'new',
  lifecycle_stage text default 'lead',
  assigned_agent_id uuid references public.agents(id) on delete set null,
  tags text[] default '{}',

  custom_fields jsonb default '{}'::jsonb,

  first_message_at timestamptz,
  last_message_at timestamptz,
  last_agent_reply_at timestamptz,
  total_conversations int default 0,
  total_messages_received int default 0,
  total_messages_sent int default 0,

  total_order_value decimal(12,2) default 0,
  total_orders int default 0,
  average_order_value decimal(12,2) default 0,
  last_order_at timestamptz,

  opted_in boolean default true,
  opted_out_at timestamptz,
  opt_in_source text,

  city text,
  state text,
  country text default 'IN',
  language text default 'en',

  notes text,
  internal_notes text,

  is_blocked boolean default false,
  blocked_at timestamptz,
  block_reason text,

  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(workspace_id, wa_id)
);

-- ============================================================
-- CONVERSATIONS
-- ============================================================
create table if not exists public.conversations (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid references public.workspaces(id) on delete cascade not null,
  contact_id uuid references public.contacts(id) on delete cascade not null,
  assigned_agent_id uuid references public.agents(id) on delete set null,

  status text default 'open',
  priority text default 'normal',
  channel text default 'whatsapp',

  customer_window_expires_at timestamptz,
  business_initiated boolean default false,

  labels text[] default '{}',

  first_response_at timestamptz,
  resolved_at timestamptz,
  resolved_by uuid references public.agents(id),
  resolution_time_seconds int,
  first_response_time_seconds int,

  snoozed_until timestamptz,

  source text default 'inbound',
  source_metadata jsonb,

  workflow_stage text,
  workflow_data jsonb default '{}'::jsonb,

  last_message_at timestamptz,
  last_message_preview text,
  unread_count int default 0,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- MESSAGES
-- ============================================================
create table if not exists public.messages (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid references public.workspaces(id) on delete cascade not null,
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  contact_id uuid references public.contacts(id) on delete cascade not null,

  direction text not null,
  sent_by_agent_id uuid references public.agents(id) on delete set null,
  sent_by_automation_id uuid,

  wa_message_id text unique,

  message_type text not null,
  content text,
  caption text,

  media_url text,
  media_mime_type text,
  media_filename text,
  media_size_bytes int,
  media_wa_id text,

  template_name text,
  template_variables jsonb,

  interactive_type text,
  interactive_data jsonb,

  reply_to_wa_message_id text,

  latitude decimal(10,7),
  longitude decimal(10,7),
  location_name text,
  location_address text,

  status text default 'pending',
  status_updated_at timestamptz,
  error_code text,
  error_message text,

  reaction_emoji text,
  reacted_to_wa_message_id text,

  is_internal_note boolean default false,

  created_at timestamptz default now()
);

-- ============================================================
-- MESSAGE TEMPLATES
-- ============================================================
create table if not exists public.templates (
  id uuid primary key default uuid_generate_v4(),
  -- Legacy (pre-CRM) fields used by existing widget automation features
  business_id uuid,
  locale text,
  kind text,
  trigger text,
  message text,
  body text,
  active boolean default true,

  -- CRM fields (Meta-approved outbound templates)
  workspace_id uuid references public.workspaces(id) on delete cascade,
  name text,
  display_name text,
  description text,

  meta_template_name text,
  meta_template_id text,
  meta_template_status text default 'draft',
  meta_rejection_reason text,

  category text,
  language text default 'en',

  header_type text,
  header_text text,
  header_media_url text,
  body_text text,
  footer_text text,

  buttons jsonb default '[]'::jsonb,
  variables jsonb default '[]'::jsonb,

  times_used int default 0,
  last_used_at timestamptz,

  industry_tags text[] default '{}',
  is_system_template boolean default false,

  created_by uuid references public.agents(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- If `public.templates` already exists (older schema), ensure CRM columns exist for RLS/pivot.
alter table public.templates
  add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.templates
  add column if not exists created_at timestamptz default now();
alter table public.templates
  add column if not exists updated_at timestamptz default now();

-- ============================================================
-- AUTOMATIONS
-- ============================================================
create table if not exists public.automations (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid references public.workspaces(id) on delete cascade not null,

  name text not null,
  description text,
  is_active boolean default true,

  trigger_type text not null,
  trigger_config jsonb not null default '{}'::jsonb,

  conditions jsonb default '[]'::jsonb,
  actions jsonb not null default '[]'::jsonb,

  times_triggered int default 0,
  last_triggered_at timestamptz,

  cooldown_hours int default 24,
  max_triggers_per_contact int default 10,

  created_by uuid references public.agents(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.automation_logs (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid references public.workspaces(id) on delete cascade not null,
  automation_id uuid references public.automations(id) on delete cascade not null,
  contact_id uuid references public.contacts(id) on delete cascade,
  conversation_id uuid references public.conversations(id) on delete cascade,

  triggered_at timestamptz default now(),
  trigger_data jsonb,
  actions_executed jsonb,
  status text default 'success',
  error_message text
);

-- ============================================================
-- ORDERS
-- ============================================================
create table if not exists public.orders (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid references public.workspaces(id) on delete cascade not null,
  contact_id uuid references public.contacts(id) on delete cascade not null,
  conversation_id uuid references public.conversations(id) on delete set null,

  order_number text unique,

  order_type text default 'order',
  title text,

  status text default 'new',

  items jsonb default '[]'::jsonb,

  subtotal decimal(12,2) default 0,
  discount_amount decimal(12,2) default 0,
  discount_code text,
  tax_amount decimal(12,2) default 0,
  tax_percentage decimal(5,2) default 0,
  total_amount decimal(12,2) default 0,
  currency text default 'INR',

  payment_status text default 'pending',
  payment_method text,
  payment_reference text,
  amount_paid decimal(12,2) default 0,
  due_date date,
  paid_at timestamptz,

  scheduled_at timestamptz,
  scheduled_end_at timestamptz,
  location text,
  latitude decimal(10,7),
  longitude decimal(10,7),

  assigned_agent_id uuid references public.agents(id) on delete set null,

  notes text,
  internal_notes text,

  attachments jsonb default '[]'::jsonb,
  metadata jsonb default '{}'::jsonb,

  razorpay_payment_link_id text,
  razorpay_payment_link_url text,
  razorpay_payment_link_expires_at timestamptz,

  created_by uuid references public.agents(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- CATALOG
-- ============================================================
create table if not exists public.catalog_items (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid references public.workspaces(id) on delete cascade not null,

  name text not null,
  description text,
  category text,
  subcategory text,

  item_type text default 'product',

  price decimal(12,2),
  sale_price decimal(12,2),
  price_unit text default 'fixed',
  currency text default 'INR',
  tax_inclusive boolean default true,
  tax_percentage decimal(5,2) default 18.0,

  image_urls text[] default '{}',

  sku text,
  track_inventory boolean default false,
  stock_quantity int,
  low_stock_alert_at int default 5,
  is_available boolean default true,

  duration_minutes int,
  buffer_minutes int default 0,

  wa_catalog_id text,

  display_order int default 0,

  tags text[] default '{}',

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- BROADCASTS
-- ============================================================
create table if not exists public.broadcasts (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid references public.workspaces(id) on delete cascade not null,
  created_by uuid references public.agents(id) not null,

  name text not null,
  template_id uuid references public.templates(id),

  audience_type text default 'manual',
  audience_filters jsonb default '{}'::jsonb,
  contact_ids uuid[] default '{}',
  estimated_recipients int default 0,

  variable_mapping jsonb default '{}'::jsonb,

  status text default 'draft',
  scheduled_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,

  total_sent int default 0,
  total_delivered int default 0,
  total_read int default 0,
  total_failed int default 0,
  total_replied int default 0,

  notes text,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.broadcast_messages (
  id uuid primary key default uuid_generate_v4(),
  broadcast_id uuid references public.broadcasts(id) on delete cascade not null,
  contact_id uuid references public.contacts(id) on delete cascade not null,
  message_id uuid references public.messages(id) on delete set null,

  status text default 'pending',
  error_code text,
  sent_at timestamptz,
  delivered_at timestamptz,
  read_at timestamptz,
  replied_at timestamptz
);

-- ============================================================
-- QUICK REPLIES
-- ============================================================
create table if not exists public.quick_replies (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid references public.workspaces(id) on delete cascade not null,

  shortcut text not null,
  title text not null,
  content text not null,

  has_attachment boolean default false,
  attachment_url text,
  attachment_type text,

  category text,

  times_used int default 0,
  is_shared boolean default true,
  created_by uuid references public.agents(id),

  created_at timestamptz default now(),
  unique(workspace_id, shortcut)
);

-- ============================================================
-- LABELS
-- ============================================================
create table if not exists public.labels (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid references public.workspaces(id) on delete cascade not null,

  name text not null,
  color text not null default '#25D366',
  description text,

  auto_assign_keywords text[] default '{}',

  display_order int default 0,
  times_used int default 0,

  created_at timestamptz default now(),
  unique(workspace_id, name)
);

-- ============================================================
-- PAYMENT LINKS
-- ============================================================
create table if not exists public.payment_links (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid references public.workspaces(id) on delete cascade not null,
  contact_id uuid references public.contacts(id) on delete cascade not null,
  order_id uuid references public.orders(id) on delete set null,

  amount decimal(12,2) not null,
  currency text default 'INR',
  description text,

  razorpay_payment_link_id text unique,
  razorpay_payment_link_url text,
  short_url text,

  status text default 'created',
  expires_at timestamptz,
  paid_at timestamptz,
  razorpay_payment_id text,

  message_id uuid references public.messages(id),

  created_by uuid references public.agents(id),
  created_at timestamptz default now()
);

-- ============================================================
-- CONTACT IMPORT JOBS
-- ============================================================
create table if not exists public.import_jobs (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid references public.workspaces(id) on delete cascade not null,
  created_by uuid references public.agents(id) not null,

  filename text,
  file_url text,

  status text default 'pending',

  total_rows int default 0,
  processed_rows int default 0,
  created_contacts int default 0,
  updated_contacts int default 0,
  skipped_rows int default 0,
  errors jsonb default '[]'::jsonb,

  field_mapping jsonb,

  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz default now()
);

-- ============================================================
-- WORKSPACE ANALYTICS SNAPSHOTS
-- ============================================================
create table if not exists public.analytics_daily (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid references public.workspaces(id) on delete cascade not null,
  date date not null,

  new_conversations int default 0,
  resolved_conversations int default 0,
  open_conversations int default 0,

  messages_received int default 0,
  messages_sent int default 0,

  avg_first_response_seconds int default 0,
  avg_resolution_seconds int default 0,

  new_contacts int default 0,
  active_contacts int default 0,

  orders_created int default 0,
  orders_completed int default 0,
  revenue_logged decimal(12,2) default 0,

  automations_triggered int default 0,
  templates_sent int default 0,

  broadcasts_sent int default 0,
  broadcast_messages_sent int default 0,
  broadcast_read_rate decimal(5,2) default 0,

  unique(workspace_id, date)
);

-- ============================================================
-- WIDGET CONFIGURATIONS (existing feature — extended)
-- ============================================================
create table if not exists public.widget_configs (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid references public.workspaces(id) on delete cascade not null unique,

  position text default 'bottom_right',
  button_color text default '#25D366',
  button_icon text default 'whatsapp',
  custom_icon_url text,

  show_pre_chat_form boolean default false,
  pre_chat_title text default 'Chat with us!',
  pre_chat_message text default 'Hi! How can we help you today?',
  pre_chat_fields jsonb default '["name", "phone"]'::jsonb,

  show_on_mobile boolean default true,
  show_on_desktop boolean default true,
  auto_open_delay_seconds int default 0,
  greeting_message text,
  pre_filled_message text,

  show_away_message boolean default false,
  away_message text default 'We are currently away. We will reply as soon as we are back!',

  business_hours_enabled boolean default false,
  business_hours jsonb default '{"mon": {"open": "09:00", "close": "18:00", "enabled": true}, "tue": {"open": "09:00", "close": "18:00", "enabled": true}, "wed": {"open": "09:00", "close": "18:00", "enabled": true}, "thu": {"open": "09:00", "close": "18:00", "enabled": true}, "fri": {"open": "09:00", "close": "18:00", "enabled": true}, "sat": {"open": "10:00", "close": "14:00", "enabled": false}, "sun": {"open": "10:00", "close": "14:00", "enabled": false}}'::jsonb,

  allowed_domains text[] default '{}',
  total_clicks int default 0,
  total_conversations_started int default 0,

  updated_at timestamptz default now()
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid references public.workspaces(id) on delete cascade not null,
  agent_id uuid references public.agents(id) on delete cascade not null,

  type text not null,
  title text not null,
  body text,

  conversation_id uuid references public.conversations(id) on delete cascade,
  contact_id uuid references public.contacts(id) on delete cascade,

  is_read boolean default false,
  read_at timestamptz,

  created_at timestamptz default now()
);

-- ============================================================
-- Indexes (performance critical)
-- ============================================================
create index if not exists idx_conversations_workspace on public.conversations(workspace_id, status, last_message_at desc);
create index if not exists idx_conversations_contact on public.conversations(contact_id, status);
create index if not exists idx_conversations_agent on public.conversations(assigned_agent_id, status);
create index if not exists idx_messages_conversation on public.messages(conversation_id, created_at);
create index if not exists idx_messages_wa_id on public.messages(wa_message_id);
create index if not exists idx_contacts_workspace on public.contacts(workspace_id, status, last_message_at desc);
create index if not exists idx_contacts_wa_id on public.contacts(workspace_id, wa_id);
create index if not exists idx_contacts_tags on public.contacts using gin(tags);
create index if not exists idx_contacts_assigned on public.contacts(assigned_agent_id);
create index if not exists idx_broadcast_messages_broadcast on public.broadcast_messages(broadcast_id, status);
create index if not exists idx_automation_logs_automation on public.automation_logs(automation_id, triggered_at desc);
create index if not exists idx_analytics_daily_workspace on public.analytics_daily(workspace_id, date desc);
create index if not exists idx_notifications_agent on public.notifications(agent_id, is_read, created_at desc);
create index if not exists idx_orders_workspace on public.orders(workspace_id, status, created_at desc);
create index if not exists idx_orders_contact on public.orders(contact_id);

-- ============================================================
-- RLS enablement
-- ============================================================
alter table public.workspaces enable row level security;
alter table public.whatsapp_connections enable row level security;
alter table public.agents enable row level security;
alter table public.contacts enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.templates enable row level security;
alter table public.automations enable row level security;
alter table public.automation_logs enable row level security;
alter table public.orders enable row level security;
alter table public.broadcasts enable row level security;
alter table public.broadcast_messages enable row level security;
alter table public.catalog_items enable row level security;
alter table public.widget_configs enable row level security;
alter table public.quick_replies enable row level security;
alter table public.labels enable row level security;
alter table public.payment_links enable row level security;
alter table public.import_jobs enable row level security;
alter table public.analytics_daily enable row level security;
alter table public.notifications enable row level security;

-- ============================================================
-- RLS policies (workspace isolation via agents membership)
-- ============================================================

-- workspaces: owner or active agent
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'workspaces'
      and policyname = 'workspace_member_access'
  ) then
    execute $p$
      create policy "workspace_member_access"
      on public.workspaces
      for all
      using (
        owner_id = auth.uid()
        or id in (
          select a.workspace_id
          from public.agents a
          where a.user_id = auth.uid()
            and a.is_active = true
        )
      )
      with check (
        owner_id = auth.uid()
        or id in (
          select a.workspace_id
          from public.agents a
          where a.user_id = auth.uid()
            and a.is_active = true
        )
      );
    $p$;
  end if;
end $$;

-- standard pattern for tables with workspace_id
do $$
declare
  t text;
begin
  foreach t in array array[
    'whatsapp_connections',
    'agents',
    'contacts',
    'conversations',
    'messages',
    'templates',
    'automations',
    'automation_logs',
    'orders',
    'broadcasts',
    'catalog_items',
    'widget_configs',
    'quick_replies',
    'labels',
    'payment_links',
    'import_jobs',
    'analytics_daily',
    'notifications'
  ]
  loop
    if not exists (
      select 1
      from pg_policies
      where schemaname = 'public'
        and tablename = t
        and policyname = 'workspace_member_access'
    ) then
      execute format($p$
        create policy "workspace_member_access"
        on public.%I
        for all
        using (public.is_workspace_member(workspace_id))
        with check (public.is_workspace_member(workspace_id));
      $p$, t);
    end if;
  end loop;
end $$;

-- broadcast_messages: derive workspace via broadcasts
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'broadcast_messages'
      and policyname = 'workspace_member_access'
  ) then
    execute $p$
      create policy "workspace_member_access"
      on public.broadcast_messages
      for all
      using (
        exists (
          select 1
          from public.broadcasts b
          where b.id = broadcast_id
            and public.is_workspace_member(b.workspace_id)
        )
      )
      with check (
        exists (
          select 1
          from public.broadcasts b
          where b.id = broadcast_id
            and public.is_workspace_member(b.workspace_id)
        )
      );
    $p$;
  end if;
end $$;

-- ============================================================
-- Triggers: updated_at
-- ============================================================
do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'workspaces_set_updated_at') then
    create trigger workspaces_set_updated_at
      before update on public.workspaces
      for each row execute function public.update_updated_at();
  end if;

  if not exists (select 1 from pg_trigger where tgname = 'whatsapp_connections_set_updated_at') then
    create trigger whatsapp_connections_set_updated_at
      before update on public.whatsapp_connections
      for each row execute function public.update_updated_at();
  end if;

  if not exists (select 1 from pg_trigger where tgname = 'contacts_set_updated_at') then
    create trigger contacts_set_updated_at
      before update on public.contacts
      for each row execute function public.update_updated_at();
  end if;

  if not exists (select 1 from pg_trigger where tgname = 'conversations_set_updated_at') then
    create trigger conversations_set_updated_at
      before update on public.conversations
      for each row execute function public.update_updated_at();
  end if;

  if not exists (select 1 from pg_trigger where tgname = 'templates_set_updated_at') then
    create trigger templates_set_updated_at
      before update on public.templates
      for each row execute function public.update_updated_at();
  end if;

  if not exists (select 1 from pg_trigger where tgname = 'automations_set_updated_at') then
    create trigger automations_set_updated_at
      before update on public.automations
      for each row execute function public.update_updated_at();
  end if;

  if not exists (select 1 from pg_trigger where tgname = 'orders_set_updated_at') then
    create trigger orders_set_updated_at
      before update on public.orders
      for each row execute function public.update_updated_at();
  end if;

  if not exists (select 1 from pg_trigger where tgname = 'catalog_items_set_updated_at') then
    create trigger catalog_items_set_updated_at
      before update on public.catalog_items
      for each row execute function public.update_updated_at();
  end if;

  if not exists (select 1 from pg_trigger where tgname = 'broadcasts_set_updated_at') then
    create trigger broadcasts_set_updated_at
      before update on public.broadcasts
      for each row execute function public.update_updated_at();
  end if;

  if not exists (select 1 from pg_trigger where tgname = 'widget_configs_set_updated_at') then
    create trigger widget_configs_set_updated_at
      before update on public.widget_configs
      for each row execute function public.update_updated_at();
  end if;
end $$;

-- ============================================================
-- Order number generation (sequence + trigger)
-- ============================================================
create sequence if not exists public.order_number_seq start 1;

create or replace function public.generate_order_number()
returns trigger
language plpgsql
as $$
begin
  if new.order_number is null or new.order_number = '' then
    new.order_number =
      'ORD-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.order_number_seq')::text, 5, '0');
  end if;
  return new;
end;
$$;

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'orders_auto_order_number') then
    create trigger orders_auto_order_number
      before insert on public.orders
      for each row execute function public.generate_order_number();
  end if;
end $$;

