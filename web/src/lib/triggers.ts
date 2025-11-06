export const TRIGGERS = [
  // A) Timing / Availability
  "default",
  "off_hours",
  "after_hours_followup",
  "holiday_closure",
  "queue_busy",

  // B) Visitor Intent
  "sales_inquiry",
  "support_help",
  "demo_booking",
  "quote_request",
  "whatsapp_optin_confirm",

  // C) Lifecycle
  "first_visit",
  "returning_visit",
  "lead_captured_thanks",
  "inactive_24h_nudge",

  // D) Campaign / Context
  "utm_campaign",   // use placeholders like {utm_campaign} in message
  "page_context",   // {page_title} / {product} etc.
  "geo_locale",     // copies by locale already supported

  // E) Transactional / Support (content now; auto-fire later via webhooks)
  "payment_success",
  "payment_failed",
  "appointment_confirmed",
  "appointment_reminder",
  "order_shipped",
  "order_delivered",
  "nps_feedback_request",
] as const;

export type TriggerCode = typeof TRIGGERS[number];

export const TRIGGER_INFO: Record<TriggerCode, string> = {
  // A) Timing / Availability
  default: "Inside business hours; friendly greeting.",
  off_hours: "Outside hours; promise callback with next open time.",
  after_hours_followup: "Off-hours nudge after delay/return.",
  holiday_closure: "Holiday message; next open date.",
  queue_busy: "High volume; set expectations on reply time.",

  // B) Visitor Intent
  sales_inquiry: "Sales questions from pricing/product pages.",
  support_help: "Support requests from help/faq.",
  demo_booking: "Book a demo; collect time & email.",
  quote_request: "Service quote; collect job/location/time.",
  whatsapp_optin_confirm: "Confirm WhatsApp opt-in and expectations.",

  // C) Lifecycle
  first_visit: "First-time visitor intro.",
  returning_visit: "Welcome back nudge.",
  lead_captured_thanks: "Thanks + next steps after details.",
  inactive_24h_nudge: "Return within 24h; reminder or incentive.",

  // D) Campaign / Context
  utm_campaign: "Match ad/campaign promise ({utm_campaign}).",
  page_context: "Use page/product context ({page_title}/{product}).",
  geo_locale: "Localized copy by language/region.",

  // E) Transactional / Support
  payment_success: "Payment received confirmation.",
  payment_failed: "Payment failed; retry/support.",
  appointment_confirmed: "Appointment confirmation.",
  appointment_reminder: "Appointment reminder.",
  order_shipped: "Order shipped with tracking.",
  order_delivered: "Delivery confirmation + feedback ask.",
  nps_feedback_request: "1–5 satisfaction request.",
};