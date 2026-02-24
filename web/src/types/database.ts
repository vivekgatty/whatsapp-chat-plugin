/**
 * TypeScript types for the ChatMadi CRM database schema.
 *
 * These mirror the Supabase/Postgres tables defined in
 * supabase/sql/2026-02-24-001_crm_schema.sql and are intended
 * to be used with @supabase/supabase-js typed queries.
 */

// ── Enums (modelled as union types) ────────────────────────────

export type Industry =
  | "food"
  | "healthcare"
  | "education"
  | "retail"
  | "realestate"
  | "beauty"
  | "finance"
  | "logistics"
  | "hospitality"
  | "legal"
  | "fitness"
  | "events"
  | "auto"
  | "other";

export type BusinessSize = "solo" | "small" | "medium";

export type PlanTier = "trial" | "starter" | "growth" | "pro" | "enterprise";

export type SubscriptionStatus = "trialing" | "active" | "past_due" | "canceled" | "paused";

export type AgentRole = "owner" | "admin" | "agent" | "readonly";

export type ContactStatus = "new" | "active" | "follow_up" | "converted" | "lapsed" | "blocked";

export type LifecycleStage = "lead" | "prospect" | "customer" | "vip" | "churned";

export type OptInSource = "website_widget" | "manual" | "import" | "qr_code" | "ad";

export type ConversationStatus = "open" | "pending" | "resolved" | "snoozed";

export type ConversationPriority = "low" | "normal" | "high" | "urgent";

export type ConversationSource = "inbound" | "outbound_template" | "widget" | "api" | "import";

export type MessageDirection = "inbound" | "outbound";

export type MessageType =
  | "text"
  | "image"
  | "video"
  | "audio"
  | "document"
  | "location"
  | "contacts"
  | "sticker"
  | "reaction"
  | "template"
  | "interactive"
  | "order"
  | "system";

export type MessageStatus = "pending" | "sent" | "delivered" | "read" | "failed" | "deleted";

export type InteractiveType = "button" | "list" | "product" | "product_list";

export type TemplateCategory = "UTILITY" | "MARKETING" | "AUTHENTICATION";

export type MetaTemplateStatus =
  | "draft"
  | "pending"
  | "approved"
  | "rejected"
  | "paused"
  | "disabled";

export type TemplateHeaderType = "TEXT" | "IMAGE" | "VIDEO" | "DOCUMENT" | "LOCATION";

export type AutomationTriggerType =
  | "new_conversation"
  | "no_reply_by_agent"
  | "no_reply_by_customer"
  | "keyword_match"
  | "contact_tag_added"
  | "contact_created"
  | "conversation_resolved"
  | "time_based"
  | "order_status_change"
  | "appointment_reminder"
  | "payment_overdue"
  | "birthday"
  | "inactivity"
  | "first_message_of_day"
  | "webhook";

export type AutomationActionType =
  | "send_template"
  | "send_message"
  | "assign_agent"
  | "add_tag"
  | "remove_tag"
  | "update_status"
  | "update_lifecycle"
  | "create_order"
  | "send_webhook"
  | "notify_agent"
  | "snooze_conversation"
  | "resolve_conversation"
  | "update_custom_field"
  | "wait";

export type AutomationLogStatus = "success" | "partial" | "failed";

export type OrderType =
  | "order"
  | "appointment"
  | "booking"
  | "inquiry"
  | "quote"
  | "invoice"
  | "subscription";

export type PaymentStatus = "pending" | "partial" | "paid" | "overdue" | "refunded" | "waived";

export type PaymentMethod = "upi" | "cash" | "card" | "bank_transfer" | "cod" | "razorpay_link";

export type CatalogItemType =
  | "product"
  | "service"
  | "appointment_type"
  | "package"
  | "subscription";

export type PriceUnit = "fixed" | "per_hour" | "per_kg" | "per_month" | "negotiable";

export type BroadcastStatus =
  | "draft"
  | "scheduled"
  | "sending"
  | "sent"
  | "paused"
  | "cancelled"
  | "failed";

export type BroadcastAudienceType = "manual" | "segment" | "tag" | "all";

export type PaymentLinkStatus = "created" | "sent" | "paid" | "expired" | "cancelled";

export type ImportJobStatus = "pending" | "processing" | "completed" | "failed";

export type NotificationType =
  | "new_message"
  | "assigned"
  | "mentioned"
  | "resolved"
  | "broadcast_complete"
  | "automation_error";

export type WhatsAppConnectionStatus = "pending" | "active" | "suspended" | "flagged";

export type QualityRating = "GREEN" | "YELLOW" | "RED";

export type WidgetPosition = "bottom_right" | "bottom_left";

export type WidgetButtonIcon = "whatsapp" | "chat" | "custom";

// ── Row Types ──────────────────────────────────────────────────

export interface Workspace {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  industry: Industry | null;
  business_size: BusinessSize;
  timezone: string;
  language: string;
  logo_url: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  country: string;
  plan: PlanTier;
  trial_ends_at: string;
  stripe_customer_id: string | null;
  razorpay_customer_id: string | null;
  razorpay_subscription_id: string | null;
  subscription_status: SubscriptionStatus;
  monthly_conversation_limit: number;
  conversations_used_this_month: number;
  usage_reset_at: string;
  is_active: boolean;
  onboarding_completed: boolean;
  onboarding_step: string;
  created_at: string;
  updated_at: string;
}

export interface WhatsAppConnection {
  id: string;
  workspace_id: string;
  phone_number_id: string;
  phone_number: string;
  display_phone_number: string | null;
  waba_id: string;
  business_name: string | null;
  access_token: string;
  token_expires_at: string | null;
  webhook_verified: boolean;
  quality_rating: QualityRating;
  messaging_limit: string;
  status: WhatsAppConnectionStatus;
  connected_at: string;
  last_health_check_at: string | null;
  meta_embedded_signup_data: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface Agent {
  id: string;
  workspace_id: string;
  user_id: string;
  display_name: string;
  email: string;
  avatar_url: string | null;
  role: AgentRole;
  is_online: boolean;
  last_seen_at: string | null;
  notification_preferences: {
    new_message: boolean;
    assigned: boolean;
    mentioned: boolean;
    daily_summary: boolean;
  };
  working_hours: Record<string, { start: string; end: string }> | null;
  is_active: boolean;
  invited_by: string | null;
  invitation_accepted_at: string | null;
  created_at: string;
}

export interface Contact {
  id: string;
  workspace_id: string;
  wa_id: string;
  name: string | null;
  profile_name: string | null;
  phone: string | null;
  email: string | null;
  avatar_url: string | null;
  status: ContactStatus;
  lifecycle_stage: LifecycleStage;
  assigned_agent_id: string | null;
  tags: string[];
  custom_fields: Record<string, unknown>;
  first_message_at: string | null;
  last_message_at: string | null;
  last_agent_reply_at: string | null;
  total_conversations: number;
  total_messages_received: number;
  total_messages_sent: number;
  total_order_value: number;
  total_orders: number;
  average_order_value: number;
  last_order_at: string | null;
  opted_in: boolean;
  opted_out_at: string | null;
  opt_in_source: OptInSource | null;
  city: string | null;
  state: string | null;
  country: string;
  language: string;
  notes: string | null;
  internal_notes: string | null;
  is_blocked: boolean;
  blocked_at: string | null;
  block_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  workspace_id: string;
  contact_id: string;
  assigned_agent_id: string | null;
  status: ConversationStatus;
  priority: ConversationPriority;
  channel: string;
  customer_window_expires_at: string | null;
  business_initiated: boolean;
  labels: string[];
  first_response_at: string | null;
  resolved_at: string | null;
  resolved_by: string | null;
  resolution_time_seconds: number | null;
  first_response_time_seconds: number | null;
  snoozed_until: string | null;
  source: ConversationSource;
  source_metadata: Record<string, unknown> | null;
  workflow_stage: string | null;
  workflow_data: Record<string, unknown>;
  last_message_at: string | null;
  last_message_preview: string | null;
  unread_count: number;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  workspace_id: string;
  conversation_id: string;
  contact_id: string;
  direction: MessageDirection;
  sent_by_agent_id: string | null;
  sent_by_automation_id: string | null;
  wa_message_id: string | null;
  message_type: MessageType;
  content: string | null;
  caption: string | null;
  media_url: string | null;
  media_mime_type: string | null;
  media_filename: string | null;
  media_size_bytes: number | null;
  media_wa_id: string | null;
  template_name: string | null;
  template_variables: Record<string, unknown> | null;
  interactive_type: InteractiveType | null;
  interactive_data: Record<string, unknown> | null;
  reply_to_wa_message_id: string | null;
  latitude: number | null;
  longitude: number | null;
  location_name: string | null;
  location_address: string | null;
  status: MessageStatus;
  status_updated_at: string | null;
  error_code: string | null;
  error_message: string | null;
  reaction_emoji: string | null;
  reacted_to_wa_message_id: string | null;
  is_internal_note: boolean;
  created_at: string;
}

export interface Template {
  id: string;
  workspace_id: string;
  name: string;
  display_name: string;
  description: string | null;
  meta_template_name: string | null;
  meta_template_id: string | null;
  meta_template_status: MetaTemplateStatus;
  meta_rejection_reason: string | null;
  category: TemplateCategory;
  language: string;
  header_type: TemplateHeaderType | null;
  header_text: string | null;
  header_media_url: string | null;
  body_text: string;
  footer_text: string | null;
  buttons: TemplateButton[];
  variables: TemplateVariable[];
  times_used: number;
  last_used_at: string | null;
  industry_tags: string[];
  is_system_template: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface TemplateButton {
  type: "QUICK_REPLY" | "URL" | "PHONE_NUMBER";
  text: string;
  url?: string;
  phone_number?: string;
}

export interface TemplateVariable {
  index: number;
  label: string;
  example: string;
}

export interface Automation {
  id: string;
  workspace_id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  trigger_type: AutomationTriggerType;
  trigger_config: Record<string, unknown>;
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  times_triggered: number;
  last_triggered_at: string | null;
  cooldown_hours: number;
  max_triggers_per_contact: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface AutomationCondition {
  field: string;
  operator: "equals" | "not_equals" | "contains" | "not_contains" | "gt" | "lt";
  value: string | number | boolean;
}

export interface AutomationAction {
  type: AutomationActionType;
  [key: string]: unknown;
}

export interface AutomationLog {
  id: string;
  workspace_id: string;
  automation_id: string;
  contact_id: string | null;
  conversation_id: string | null;
  triggered_at: string;
  trigger_data: Record<string, unknown> | null;
  actions_executed: Record<string, unknown> | null;
  status: AutomationLogStatus;
  error_message: string | null;
}

export interface OrderItem {
  name: string;
  qty: number;
  unit_price: number;
  total: number;
  sku?: string;
  notes?: string;
}

export interface Order {
  id: string;
  workspace_id: string;
  contact_id: string;
  conversation_id: string | null;
  order_number: string;
  order_type: OrderType;
  title: string | null;
  status: string;
  items: OrderItem[];
  subtotal: number;
  discount_amount: number;
  discount_code: string | null;
  tax_amount: number;
  tax_percentage: number;
  total_amount: number;
  currency: string;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod | null;
  payment_reference: string | null;
  amount_paid: number;
  due_date: string | null;
  paid_at: string | null;
  scheduled_at: string | null;
  scheduled_end_at: string | null;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  assigned_agent_id: string | null;
  notes: string | null;
  internal_notes: string | null;
  attachments: { url: string; name: string; type: string }[];
  metadata: Record<string, unknown>;
  razorpay_payment_link_id: string | null;
  razorpay_payment_link_url: string | null;
  razorpay_payment_link_expires_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CatalogItem {
  id: string;
  workspace_id: string;
  name: string;
  description: string | null;
  category: string | null;
  subcategory: string | null;
  item_type: CatalogItemType;
  price: number | null;
  sale_price: number | null;
  price_unit: PriceUnit;
  currency: string;
  tax_inclusive: boolean;
  tax_percentage: number;
  image_urls: string[];
  sku: string | null;
  track_inventory: boolean;
  stock_quantity: number | null;
  low_stock_alert_at: number;
  is_available: boolean;
  duration_minutes: number | null;
  buffer_minutes: number;
  wa_catalog_id: string | null;
  display_order: number;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface Broadcast {
  id: string;
  workspace_id: string;
  created_by: string;
  name: string;
  template_id: string | null;
  audience_type: BroadcastAudienceType;
  audience_filters: Record<string, unknown>;
  contact_ids: string[];
  estimated_recipients: number;
  variable_mapping: Record<string, string>;
  status: BroadcastStatus;
  scheduled_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  total_sent: number;
  total_delivered: number;
  total_read: number;
  total_failed: number;
  total_replied: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface BroadcastMessage {
  id: string;
  broadcast_id: string;
  contact_id: string;
  message_id: string | null;
  status: string;
  error_code: string | null;
  sent_at: string | null;
  delivered_at: string | null;
  read_at: string | null;
  replied_at: string | null;
}

export interface QuickReply {
  id: string;
  workspace_id: string;
  shortcut: string;
  title: string;
  content: string;
  has_attachment: boolean;
  attachment_url: string | null;
  attachment_type: string | null;
  category: string | null;
  times_used: number;
  is_shared: boolean;
  created_by: string | null;
  created_at: string;
}

export interface Label {
  id: string;
  workspace_id: string;
  name: string;
  color: string;
  description: string | null;
  auto_assign_keywords: string[];
  display_order: number;
  times_used: number;
  created_at: string;
}

export interface PaymentLink {
  id: string;
  workspace_id: string;
  contact_id: string;
  order_id: string | null;
  amount: number;
  currency: string;
  description: string | null;
  razorpay_payment_link_id: string | null;
  razorpay_payment_link_url: string | null;
  short_url: string | null;
  status: PaymentLinkStatus;
  expires_at: string | null;
  paid_at: string | null;
  razorpay_payment_id: string | null;
  message_id: string | null;
  created_by: string | null;
  created_at: string;
}

export interface ImportJob {
  id: string;
  workspace_id: string;
  created_by: string;
  filename: string | null;
  file_url: string | null;
  status: ImportJobStatus;
  total_rows: number;
  processed_rows: number;
  created_contacts: number;
  updated_contacts: number;
  skipped_rows: number;
  errors: { row: number; message: string }[];
  field_mapping: Record<string, string> | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface AnalyticsDaily {
  id: string;
  workspace_id: string;
  date: string;
  new_conversations: number;
  resolved_conversations: number;
  open_conversations: number;
  messages_received: number;
  messages_sent: number;
  avg_first_response_seconds: number;
  avg_resolution_seconds: number;
  new_contacts: number;
  active_contacts: number;
  orders_created: number;
  orders_completed: number;
  revenue_logged: number;
  automations_triggered: number;
  templates_sent: number;
  broadcasts_sent: number;
  broadcast_messages_sent: number;
  broadcast_read_rate: number;
}

export interface WidgetConfig {
  id: string;
  workspace_id: string;
  position: WidgetPosition;
  button_color: string;
  button_icon: WidgetButtonIcon;
  custom_icon_url: string | null;
  show_pre_chat_form: boolean;
  pre_chat_title: string;
  pre_chat_message: string;
  pre_chat_fields: string[];
  show_on_mobile: boolean;
  show_on_desktop: boolean;
  auto_open_delay_seconds: number;
  greeting_message: string | null;
  pre_filled_message: string | null;
  show_away_message: boolean;
  away_message: string;
  business_hours_enabled: boolean;
  business_hours: Record<string, { open: string; close: string; enabled: boolean }>;
  allowed_domains: string[];
  total_clicks: number;
  total_conversations_started: number;
  updated_at: string;
}

export interface Notification {
  id: string;
  workspace_id: string;
  agent_id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  conversation_id: string | null;
  contact_id: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

// ── Supabase Database interface ────────────────────────────────

export interface Database {
  public: {
    Tables: {
      workspaces: {
        Row: Workspace;
        Insert: Partial<Workspace> & Pick<Workspace, "owner_id" | "name" | "slug">;
        Update: Partial<Workspace>;
      };
      whatsapp_connections: {
        Row: WhatsAppConnection;
        Insert: Partial<WhatsAppConnection> &
          Pick<
            WhatsAppConnection,
            "workspace_id" | "phone_number_id" | "phone_number" | "waba_id" | "access_token"
          >;
        Update: Partial<WhatsAppConnection>;
      };
      agents: {
        Row: Agent;
        Insert: Partial<Agent> & Pick<Agent, "workspace_id" | "user_id" | "display_name" | "email">;
        Update: Partial<Agent>;
      };
      contacts: {
        Row: Contact;
        Insert: Partial<Contact> & Pick<Contact, "workspace_id" | "wa_id">;
        Update: Partial<Contact>;
      };
      conversations: {
        Row: Conversation;
        Insert: Partial<Conversation> & Pick<Conversation, "workspace_id" | "contact_id">;
        Update: Partial<Conversation>;
      };
      messages: {
        Row: Message;
        Insert: Partial<Message> &
          Pick<
            Message,
            "workspace_id" | "conversation_id" | "contact_id" | "direction" | "message_type"
          >;
        Update: Partial<Message>;
      };
      templates: {
        Row: Template;
        Insert: Partial<Template> &
          Pick<Template, "workspace_id" | "name" | "display_name" | "category" | "body_text">;
        Update: Partial<Template>;
      };
      automations: {
        Row: Automation;
        Insert: Partial<Automation> & Pick<Automation, "workspace_id" | "name" | "trigger_type">;
        Update: Partial<Automation>;
      };
      automation_logs: {
        Row: AutomationLog;
        Insert: Partial<AutomationLog> & Pick<AutomationLog, "workspace_id" | "automation_id">;
        Update: Partial<AutomationLog>;
      };
      orders: {
        Row: Order;
        Insert: Partial<Order> & Pick<Order, "workspace_id" | "contact_id">;
        Update: Partial<Order>;
      };
      catalog_items: {
        Row: CatalogItem;
        Insert: Partial<CatalogItem> & Pick<CatalogItem, "workspace_id" | "name">;
        Update: Partial<CatalogItem>;
      };
      broadcasts: {
        Row: Broadcast;
        Insert: Partial<Broadcast> & Pick<Broadcast, "workspace_id" | "created_by" | "name">;
        Update: Partial<Broadcast>;
      };
      broadcast_messages: {
        Row: BroadcastMessage;
        Insert: Partial<BroadcastMessage> & Pick<BroadcastMessage, "broadcast_id" | "contact_id">;
        Update: Partial<BroadcastMessage>;
      };
      quick_replies: {
        Row: QuickReply;
        Insert: Partial<QuickReply> &
          Pick<QuickReply, "workspace_id" | "shortcut" | "title" | "content">;
        Update: Partial<QuickReply>;
      };
      labels: {
        Row: Label;
        Insert: Partial<Label> & Pick<Label, "workspace_id" | "name">;
        Update: Partial<Label>;
      };
      payment_links: {
        Row: PaymentLink;
        Insert: Partial<PaymentLink> & Pick<PaymentLink, "workspace_id" | "contact_id" | "amount">;
        Update: Partial<PaymentLink>;
      };
      import_jobs: {
        Row: ImportJob;
        Insert: Partial<ImportJob> & Pick<ImportJob, "workspace_id" | "created_by">;
        Update: Partial<ImportJob>;
      };
      analytics_daily: {
        Row: AnalyticsDaily;
        Insert: Partial<AnalyticsDaily> & Pick<AnalyticsDaily, "workspace_id" | "date">;
        Update: Partial<AnalyticsDaily>;
      };
      widget_configs: {
        Row: WidgetConfig;
        Insert: Partial<WidgetConfig> & Pick<WidgetConfig, "workspace_id">;
        Update: Partial<WidgetConfig>;
      };
      notifications: {
        Row: Notification;
        Insert: Partial<Notification> &
          Pick<Notification, "workspace_id" | "agent_id" | "type" | "title">;
        Update: Partial<Notification>;
      };
    };
  };
}
