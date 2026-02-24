-- ============================================================
-- ChatMadi CRM Platform — Complete Database Schema
-- Run date: 2026-02-24
-- ============================================================
-- IMPORTANT: Execute this entire file in your Supabase SQL editor
-- in one go. All statements are ordered by dependency.
--
-- Existing tables (businesses, widgets, leads, plans,
-- subscriptions, analytics, business_triggers, usage_counters)
-- are NOT modified — this is purely additive.
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- WORKSPACES (Multi-tenant root entity)
-- Each business that signs up gets one workspace
-- ============================================================
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  industry TEXT,
  business_size TEXT DEFAULT 'small',
  timezone TEXT DEFAULT 'Asia/Kolkata',
  language TEXT DEFAULT 'en',
  logo_url TEXT,
  website TEXT,
  address TEXT,
  city TEXT,
  country TEXT DEFAULT 'IN',
  plan TEXT DEFAULT 'trial',
  trial_ends_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '14 days',
  stripe_customer_id TEXT,
  razorpay_customer_id TEXT,
  razorpay_subscription_id TEXT,
  subscription_status TEXT DEFAULT 'trialing',
  monthly_conversation_limit INT DEFAULT 1000,
  conversations_used_this_month INT DEFAULT 0,
  usage_reset_at TIMESTAMPTZ DEFAULT DATE_TRUNC('month', NOW()) + INTERVAL '1 month',
  is_active BOOLEAN DEFAULT TRUE,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_step TEXT DEFAULT 'meta_connect',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- WHATSAPP CONNECTIONS
-- Meta Cloud API credentials for each workspace
-- ============================================================
CREATE TABLE whatsapp_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL UNIQUE,
  phone_number_id TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  display_phone_number TEXT,
  waba_id TEXT NOT NULL,
  business_name TEXT,
  access_token TEXT NOT NULL,
  token_expires_at TIMESTAMPTZ,
  webhook_verified BOOLEAN DEFAULT FALSE,
  quality_rating TEXT DEFAULT 'GREEN',
  messaging_limit TEXT DEFAULT 'TIER_1K',
  status TEXT DEFAULT 'pending',
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  last_health_check_at TIMESTAMPTZ,
  meta_embedded_signup_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- AGENTS (Team members with inbox access)
-- ============================================================
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  display_name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT DEFAULT 'agent',
  is_online BOOLEAN DEFAULT FALSE,
  last_seen_at TIMESTAMPTZ,
  notification_preferences JSONB DEFAULT '{"new_message": true, "assigned": true, "mentioned": true, "daily_summary": true}'::jsonb,
  working_hours JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  invited_by UUID REFERENCES auth.users(id),
  invitation_accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workspace_id, user_id)
);

-- ============================================================
-- CONTACTS (CRM core — every person who has messaged the business)
-- ============================================================
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  wa_id TEXT NOT NULL,
  name TEXT,
  profile_name TEXT,
  phone TEXT,
  email TEXT,
  avatar_url TEXT,
  status TEXT DEFAULT 'new',
  lifecycle_stage TEXT DEFAULT 'lead',
  assigned_agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{}',
  custom_fields JSONB DEFAULT '{}'::jsonb,
  first_message_at TIMESTAMPTZ,
  last_message_at TIMESTAMPTZ,
  last_agent_reply_at TIMESTAMPTZ,
  total_conversations INT DEFAULT 0,
  total_messages_received INT DEFAULT 0,
  total_messages_sent INT DEFAULT 0,
  total_order_value DECIMAL(12,2) DEFAULT 0,
  total_orders INT DEFAULT 0,
  average_order_value DECIMAL(12,2) DEFAULT 0,
  last_order_at TIMESTAMPTZ,
  opted_in BOOLEAN DEFAULT TRUE,
  opted_out_at TIMESTAMPTZ,
  opt_in_source TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'IN',
  language TEXT DEFAULT 'en',
  notes TEXT,
  internal_notes TEXT,
  is_blocked BOOLEAN DEFAULT FALSE,
  blocked_at TIMESTAMPTZ,
  block_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workspace_id, wa_id)
);

-- ============================================================
-- CONVERSATIONS
-- A conversation session with a contact (24h Meta window)
-- ============================================================
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE NOT NULL,
  assigned_agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'open',
  priority TEXT DEFAULT 'normal',
  channel TEXT DEFAULT 'whatsapp',
  customer_window_expires_at TIMESTAMPTZ,
  business_initiated BOOLEAN DEFAULT FALSE,
  labels TEXT[] DEFAULT '{}',
  first_response_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES agents(id),
  resolution_time_seconds INT,
  first_response_time_seconds INT,
  snoozed_until TIMESTAMPTZ,
  source TEXT DEFAULT 'inbound',
  source_metadata JSONB,
  workflow_stage TEXT,
  workflow_data JSONB DEFAULT '{}'::jsonb,
  last_message_at TIMESTAMPTZ,
  last_message_preview TEXT,
  unread_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- MESSAGES
-- Every single message in every conversation
-- ============================================================
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE NOT NULL,
  direction TEXT NOT NULL,
  sent_by_agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  sent_by_automation_id UUID,
  wa_message_id TEXT UNIQUE,
  message_type TEXT NOT NULL,
  content TEXT,
  caption TEXT,
  media_url TEXT,
  media_mime_type TEXT,
  media_filename TEXT,
  media_size_bytes INT,
  media_wa_id TEXT,
  template_name TEXT,
  template_variables JSONB,
  interactive_type TEXT,
  interactive_data JSONB,
  reply_to_wa_message_id TEXT,
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  location_name TEXT,
  location_address TEXT,
  status TEXT DEFAULT 'pending',
  status_updated_at TIMESTAMPTZ,
  error_code TEXT,
  error_message TEXT,
  reaction_emoji TEXT,
  reacted_to_wa_message_id TEXT,
  is_internal_note BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- MESSAGE TEMPLATES
-- Meta-approved templates for outbound messaging
-- ============================================================
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  meta_template_name TEXT,
  meta_template_id TEXT,
  meta_template_status TEXT DEFAULT 'draft',
  meta_rejection_reason TEXT,
  category TEXT NOT NULL,
  language TEXT DEFAULT 'en',
  header_type TEXT,
  header_text TEXT,
  header_media_url TEXT,
  body_text TEXT NOT NULL,
  footer_text TEXT,
  buttons JSONB DEFAULT '[]'::jsonb,
  variables JSONB DEFAULT '[]'::jsonb,
  times_used INT DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  industry_tags TEXT[] DEFAULT '{}',
  is_system_template BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES agents(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- AUTOMATION RULES
-- ============================================================
CREATE TABLE automations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  trigger_type TEXT NOT NULL,
  trigger_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  conditions JSONB DEFAULT '[]'::jsonb,
  actions JSONB NOT NULL DEFAULT '[]'::jsonb,
  times_triggered INT DEFAULT 0,
  last_triggered_at TIMESTAMPTZ,
  cooldown_hours INT DEFAULT 24,
  max_triggers_per_contact INT DEFAULT 10,
  created_by UUID REFERENCES agents(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Automation execution log
CREATE TABLE automation_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  automation_id UUID REFERENCES automations(id) ON DELETE CASCADE NOT NULL,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  triggered_at TIMESTAMPTZ DEFAULT NOW(),
  trigger_data JSONB,
  actions_executed JSONB,
  status TEXT DEFAULT 'success',
  error_message TEXT
);

-- ============================================================
-- ORDERS (Industry-agnostic order/transaction tracking)
-- ============================================================
CREATE SEQUENCE order_number_seq START 1;

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE NOT NULL,
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  order_number TEXT UNIQUE,
  order_type TEXT DEFAULT 'order',
  title TEXT,
  status TEXT DEFAULT 'new',
  items JSONB DEFAULT '[]'::jsonb,
  subtotal DECIMAL(12,2) DEFAULT 0,
  discount_amount DECIMAL(12,2) DEFAULT 0,
  discount_code TEXT,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  tax_percentage DECIMAL(5,2) DEFAULT 0,
  total_amount DECIMAL(12,2) DEFAULT 0,
  currency TEXT DEFAULT 'INR',
  payment_status TEXT DEFAULT 'pending',
  payment_method TEXT,
  payment_reference TEXT,
  amount_paid DECIMAL(12,2) DEFAULT 0,
  due_date DATE,
  paid_at TIMESTAMPTZ,
  scheduled_at TIMESTAMPTZ,
  scheduled_end_at TIMESTAMPTZ,
  location TEXT,
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  assigned_agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  notes TEXT,
  internal_notes TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  razorpay_payment_link_id TEXT,
  razorpay_payment_link_url TEXT,
  razorpay_payment_link_expires_at TIMESTAMPTZ,
  created_by UUID REFERENCES agents(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CATALOG (Products/Services offered by the business)
-- ============================================================
CREATE TABLE catalog_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  subcategory TEXT,
  item_type TEXT DEFAULT 'product',
  price DECIMAL(12,2),
  sale_price DECIMAL(12,2),
  price_unit TEXT DEFAULT 'fixed',
  currency TEXT DEFAULT 'INR',
  tax_inclusive BOOLEAN DEFAULT TRUE,
  tax_percentage DECIMAL(5,2) DEFAULT 18.0,
  image_urls TEXT[] DEFAULT '{}',
  sku TEXT,
  track_inventory BOOLEAN DEFAULT FALSE,
  stock_quantity INT,
  low_stock_alert_at INT DEFAULT 5,
  is_available BOOLEAN DEFAULT TRUE,
  duration_minutes INT,
  buffer_minutes INT DEFAULT 0,
  wa_catalog_id TEXT,
  display_order INT DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- BROADCASTS
-- Send template messages to multiple contacts at once
-- ============================================================
CREATE TABLE broadcasts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  created_by UUID REFERENCES agents(id) NOT NULL,
  name TEXT NOT NULL,
  template_id UUID REFERENCES templates(id),
  audience_type TEXT DEFAULT 'manual',
  audience_filters JSONB DEFAULT '{}'::jsonb,
  contact_ids UUID[] DEFAULT '{}',
  estimated_recipients INT DEFAULT 0,
  variable_mapping JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'draft',
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  total_sent INT DEFAULT 0,
  total_delivered INT DEFAULT 0,
  total_read INT DEFAULT 0,
  total_failed INT DEFAULT 0,
  total_replied INT DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Track each message in a broadcast
CREATE TABLE broadcast_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  broadcast_id UUID REFERENCES broadcasts(id) ON DELETE CASCADE NOT NULL,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE NOT NULL,
  message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending',
  error_code TEXT,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  replied_at TIMESTAMPTZ
);

-- ============================================================
-- QUICK REPLIES
-- Saved responses agents can insert with a /shortcut
-- ============================================================
CREATE TABLE quick_replies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  shortcut TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  has_attachment BOOLEAN DEFAULT FALSE,
  attachment_url TEXT,
  attachment_type TEXT,
  category TEXT,
  times_used INT DEFAULT 0,
  is_shared BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES agents(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workspace_id, shortcut)
);

-- ============================================================
-- LABELS
-- Color-coded tags for conversations
-- ============================================================
CREATE TABLE labels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#25D366',
  description TEXT,
  auto_assign_keywords TEXT[] DEFAULT '{}',
  display_order INT DEFAULT 0,
  times_used INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workspace_id, name)
);

-- ============================================================
-- PAYMENT LINKS
-- Razorpay payment links sent via WhatsApp
-- ============================================================
CREATE TABLE payment_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE NOT NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  description TEXT,
  razorpay_payment_link_id TEXT UNIQUE,
  razorpay_payment_link_url TEXT,
  short_url TEXT,
  status TEXT DEFAULT 'created',
  expires_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  razorpay_payment_id TEXT,
  message_id UUID REFERENCES messages(id),
  created_by UUID REFERENCES agents(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CONTACT IMPORT JOBS
-- Track bulk contact imports
-- ============================================================
CREATE TABLE import_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  created_by UUID REFERENCES agents(id) NOT NULL,
  filename TEXT,
  file_url TEXT,
  status TEXT DEFAULT 'pending',
  total_rows INT DEFAULT 0,
  processed_rows INT DEFAULT 0,
  created_contacts INT DEFAULT 0,
  updated_contacts INT DEFAULT 0,
  skipped_rows INT DEFAULT 0,
  errors JSONB DEFAULT '[]'::jsonb,
  field_mapping JSONB,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- WORKSPACE ANALYTICS SNAPSHOTS
-- Daily aggregated stats for fast dashboard loading
-- ============================================================
CREATE TABLE analytics_daily (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  new_conversations INT DEFAULT 0,
  resolved_conversations INT DEFAULT 0,
  open_conversations INT DEFAULT 0,
  messages_received INT DEFAULT 0,
  messages_sent INT DEFAULT 0,
  avg_first_response_seconds INT DEFAULT 0,
  avg_resolution_seconds INT DEFAULT 0,
  new_contacts INT DEFAULT 0,
  active_contacts INT DEFAULT 0,
  orders_created INT DEFAULT 0,
  orders_completed INT DEFAULT 0,
  revenue_logged DECIMAL(12,2) DEFAULT 0,
  automations_triggered INT DEFAULT 0,
  templates_sent INT DEFAULT 0,
  broadcasts_sent INT DEFAULT 0,
  broadcast_messages_sent INT DEFAULT 0,
  broadcast_read_rate DECIMAL(5,2) DEFAULT 0,
  UNIQUE(workspace_id, date)
);

-- ============================================================
-- WIDGET CONFIGURATIONS (extends existing widget feature)
-- ============================================================
CREATE TABLE widget_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL UNIQUE,
  position TEXT DEFAULT 'bottom_right',
  button_color TEXT DEFAULT '#25D366',
  button_icon TEXT DEFAULT 'whatsapp',
  custom_icon_url TEXT,
  show_pre_chat_form BOOLEAN DEFAULT FALSE,
  pre_chat_title TEXT DEFAULT 'Chat with us!',
  pre_chat_message TEXT DEFAULT 'Hi! How can we help you today?',
  pre_chat_fields JSONB DEFAULT '["name", "phone"]'::jsonb,
  show_on_mobile BOOLEAN DEFAULT TRUE,
  show_on_desktop BOOLEAN DEFAULT TRUE,
  auto_open_delay_seconds INT DEFAULT 0,
  greeting_message TEXT,
  pre_filled_message TEXT,
  show_away_message BOOLEAN DEFAULT FALSE,
  away_message TEXT DEFAULT 'We are currently away. We will reply as soon as we are back!',
  business_hours_enabled BOOLEAN DEFAULT FALSE,
  business_hours JSONB DEFAULT '{
    "mon": {"open": "09:00", "close": "18:00", "enabled": true},
    "tue": {"open": "09:00", "close": "18:00", "enabled": true},
    "wed": {"open": "09:00", "close": "18:00", "enabled": true},
    "thu": {"open": "09:00", "close": "18:00", "enabled": true},
    "fri": {"open": "09:00", "close": "18:00", "enabled": true},
    "sat": {"open": "10:00", "close": "14:00", "enabled": false},
    "sun": {"open": "10:00", "close": "14:00", "enabled": false}
  }'::jsonb,
  allowed_domains TEXT[] DEFAULT '{}',
  total_clicks INT DEFAULT 0,
  total_conversations_started INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- NOTIFICATIONS
-- In-app notifications for agents
-- ============================================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_conversations_workspace ON conversations(workspace_id, status, last_message_at DESC);
CREATE INDEX idx_conversations_contact ON conversations(contact_id, status);
CREATE INDEX idx_conversations_agent ON conversations(assigned_agent_id, status);
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at);
CREATE INDEX idx_messages_wa_id ON messages(wa_message_id);
CREATE INDEX idx_contacts_workspace ON contacts(workspace_id, status, last_message_at DESC);
CREATE INDEX idx_contacts_wa_id ON contacts(workspace_id, wa_id);
CREATE INDEX idx_contacts_tags ON contacts USING GIN(tags);
CREATE INDEX idx_contacts_assigned ON contacts(assigned_agent_id);
CREATE INDEX idx_broadcast_messages_broadcast ON broadcast_messages(broadcast_id, status);
CREATE INDEX idx_automation_logs_automation ON automation_logs(automation_id, triggered_at DESC);
CREATE INDEX idx_analytics_daily_workspace ON analytics_daily(workspace_id, date DESC);
CREATE INDEX idx_notifications_agent ON notifications(agent_id, is_read, created_at DESC);
CREATE INDEX idx_orders_workspace ON orders(workspace_id, status, created_at DESC);
CREATE INDEX idx_orders_contact ON orders(contact_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE broadcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE broadcast_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE widget_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE quick_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES
-- All workspace-scoped tables use the same membership check:
-- the user must be the workspace owner or an active agent.
-- ============================================================

CREATE POLICY "Users can access their workspace data" ON workspaces
  FOR ALL USING (
    owner_id = auth.uid() OR
    id IN (SELECT workspace_id FROM agents WHERE user_id = auth.uid() AND is_active = TRUE)
  );

CREATE POLICY "Workspace members can access whatsapp_connections" ON whatsapp_connections
  FOR ALL USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
      UNION
      SELECT workspace_id FROM agents WHERE user_id = auth.uid() AND is_active = TRUE
    )
  );

CREATE POLICY "Workspace members can access agents" ON agents
  FOR ALL USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
      UNION
      SELECT workspace_id FROM agents WHERE user_id = auth.uid() AND is_active = TRUE
    )
  );

CREATE POLICY "Workspace members can access contacts" ON contacts
  FOR ALL USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
      UNION
      SELECT workspace_id FROM agents WHERE user_id = auth.uid() AND is_active = TRUE
    )
  );

CREATE POLICY "Workspace members can access conversations" ON conversations
  FOR ALL USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
      UNION
      SELECT workspace_id FROM agents WHERE user_id = auth.uid() AND is_active = TRUE
    )
  );

CREATE POLICY "Workspace members can access messages" ON messages
  FOR ALL USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
      UNION
      SELECT workspace_id FROM agents WHERE user_id = auth.uid() AND is_active = TRUE
    )
  );

CREATE POLICY "Workspace members can access templates" ON templates
  FOR ALL USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
      UNION
      SELECT workspace_id FROM agents WHERE user_id = auth.uid() AND is_active = TRUE
    )
  );

CREATE POLICY "Workspace members can access automations" ON automations
  FOR ALL USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
      UNION
      SELECT workspace_id FROM agents WHERE user_id = auth.uid() AND is_active = TRUE
    )
  );

CREATE POLICY "Workspace members can access automation_logs" ON automation_logs
  FOR ALL USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
      UNION
      SELECT workspace_id FROM agents WHERE user_id = auth.uid() AND is_active = TRUE
    )
  );

CREATE POLICY "Workspace members can access orders" ON orders
  FOR ALL USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
      UNION
      SELECT workspace_id FROM agents WHERE user_id = auth.uid() AND is_active = TRUE
    )
  );

CREATE POLICY "Workspace members can access broadcasts" ON broadcasts
  FOR ALL USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
      UNION
      SELECT workspace_id FROM agents WHERE user_id = auth.uid() AND is_active = TRUE
    )
  );

CREATE POLICY "Workspace members can access broadcast_messages" ON broadcast_messages
  FOR ALL USING (
    broadcast_id IN (
      SELECT b.id FROM broadcasts b
      WHERE b.workspace_id IN (
        SELECT id FROM workspaces WHERE owner_id = auth.uid()
        UNION
        SELECT workspace_id FROM agents WHERE user_id = auth.uid() AND is_active = TRUE
      )
    )
  );

CREATE POLICY "Workspace members can access catalog_items" ON catalog_items
  FOR ALL USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
      UNION
      SELECT workspace_id FROM agents WHERE user_id = auth.uid() AND is_active = TRUE
    )
  );

CREATE POLICY "Workspace members can access widget_configs" ON widget_configs
  FOR ALL USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
      UNION
      SELECT workspace_id FROM agents WHERE user_id = auth.uid() AND is_active = TRUE
    )
  );

CREATE POLICY "Workspace members can access quick_replies" ON quick_replies
  FOR ALL USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
      UNION
      SELECT workspace_id FROM agents WHERE user_id = auth.uid() AND is_active = TRUE
    )
  );

CREATE POLICY "Workspace members can access labels" ON labels
  FOR ALL USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
      UNION
      SELECT workspace_id FROM agents WHERE user_id = auth.uid() AND is_active = TRUE
    )
  );

CREATE POLICY "Workspace members can access payment_links" ON payment_links
  FOR ALL USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
      UNION
      SELECT workspace_id FROM agents WHERE user_id = auth.uid() AND is_active = TRUE
    )
  );

CREATE POLICY "Workspace members can access import_jobs" ON import_jobs
  FOR ALL USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
      UNION
      SELECT workspace_id FROM agents WHERE user_id = auth.uid() AND is_active = TRUE
    )
  );

CREATE POLICY "Workspace members can access analytics_daily" ON analytics_daily
  FOR ALL USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
      UNION
      SELECT workspace_id FROM agents WHERE user_id = auth.uid() AND is_active = TRUE
    )
  );

CREATE POLICY "Workspace members can access notifications" ON notifications
  FOR ALL USING (
    agent_id IN (
      SELECT id FROM agents WHERE user_id = auth.uid() AND is_active = TRUE
    )
  );

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Auto-update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER set_updated_at BEFORE UPDATE ON workspaces FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON whatsapp_connections FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON templates FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON automations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON catalog_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON broadcasts FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-generate order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number = 'ORD-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('order_number_seq')::TEXT, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_order_number BEFORE INSERT ON orders FOR EACH ROW EXECUTE FUNCTION generate_order_number();
