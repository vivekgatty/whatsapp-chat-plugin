import type { Industry } from "@/types";

export interface SystemTemplate {
  name: string;
  display_name: string;
  body_text: string;
  category: "UTILITY" | "MARKETING";
  industry_tags: string[];
  variables: { index: number; label: string; example: string }[];
}

// ── Universal templates (all industries) ───────────────────

const UNIVERSAL: SystemTemplate[] = [
  {
    name: "welcome_message",
    display_name: "Welcome Message",
    body_text: "Hi {{1}}! Welcome to {{2}}. How can we help you today? 😊",
    category: "UTILITY",
    industry_tags: [],
    variables: [
      { index: 1, label: "Customer Name", example: "Priya" },
      { index: 2, label: "Business Name", example: "ChatMadi" },
    ],
  },
  {
    name: "thank_you",
    display_name: "Thank You",
    body_text: "Thank you for choosing {{1}}, {{2}}! We look forward to serving you again. 🙏",
    category: "UTILITY",
    industry_tags: [],
    variables: [
      { index: 1, label: "Business Name", example: "ChatMadi" },
      { index: 2, label: "Customer Name", example: "Priya" },
    ],
  },
  {
    name: "follow_up_48h",
    display_name: "Follow Up (48h)",
    body_text:
      "Hi {{1}}, we noticed you had a query with us. We'd love to help! Can we assist you with something? 😊",
    category: "UTILITY",
    industry_tags: [],
    variables: [{ index: 1, label: "Customer Name", example: "Priya" }],
  },
  {
    name: "payment_received",
    display_name: "Payment Received",
    body_text:
      "Hi {{1}}, we've received your payment of ₹{{2}}. Thank you! Your receipt number is {{3}}. 🎉",
    category: "UTILITY",
    industry_tags: [],
    variables: [
      { index: 1, label: "Customer Name", example: "Priya" },
      { index: 2, label: "Amount", example: "1,500" },
      { index: 3, label: "Receipt Number", example: "RCT-2026-001" },
    ],
  },
  {
    name: "away_message",
    display_name: "Away / Out of Hours",
    body_text:
      "Hi {{1}}! Thanks for reaching out to {{2}}. We're currently closed but will reply as soon as we open. Our hours are {{3}}.",
    category: "UTILITY",
    industry_tags: [],
    variables: [
      { index: 1, label: "Customer Name", example: "Priya" },
      { index: 2, label: "Business Name", example: "ChatMadi" },
      { index: 3, label: "Business Hours", example: "Mon-Sat 9AM-6PM" },
    ],
  },
];

// ── Food & Restaurant ──────────────────────────────────────

const FOOD: SystemTemplate[] = [
  {
    name: "food_order_confirmed",
    display_name: "Order Confirmed",
    body_text:
      "Hi {{1}}, your order has been confirmed! 🎉 Order #{{2}} | Items: {{3}} | Total: ₹{{4}} | Estimated delivery: {{5}} mins",
    category: "UTILITY",
    industry_tags: ["food"],
    variables: [
      { index: 1, label: "Customer Name", example: "Priya" },
      { index: 2, label: "Order Number", example: "ORD-2026-042" },
      { index: 3, label: "Items", example: "Butter Chicken x2, Naan x4" },
      { index: 4, label: "Total", example: "850" },
      { index: 5, label: "Time", example: "30" },
    ],
  },
  {
    name: "food_order_ready",
    display_name: "Order Ready",
    body_text: "Hi {{1}}, your order #{{2}} is ready! {{3}} 🛵",
    category: "UTILITY",
    industry_tags: ["food"],
    variables: [
      { index: 1, label: "Customer Name", example: "Priya" },
      { index: 2, label: "Order Number", example: "ORD-2026-042" },
      { index: 3, label: "Pickup/Delivery Note", example: "Pick up at counter 3" },
    ],
  },
  {
    name: "food_delivery_update",
    display_name: "Delivery Update",
    body_text:
      "Hi {{1}}, your order #{{2}} is out for delivery! Our delivery partner will arrive in {{3}} minutes. 📍",
    category: "UTILITY",
    industry_tags: ["food"],
    variables: [
      { index: 1, label: "Customer Name", example: "Priya" },
      { index: 2, label: "Order Number", example: "ORD-2026-042" },
      { index: 3, label: "Minutes", example: "15" },
    ],
  },
  {
    name: "food_reorder_prompt",
    display_name: "Reorder Prompt",
    body_text:
      "Hi {{1}}! It's been a while since your last order 😊 Would you like to order your usual? Reply YES and we'll get started!",
    category: "MARKETING",
    industry_tags: ["food"],
    variables: [{ index: 1, label: "Customer Name", example: "Priya" }],
  },
];

// ── Healthcare ─────────────────────────────────────────────

const HEALTHCARE: SystemTemplate[] = [
  {
    name: "health_appointment_confirmed",
    display_name: "Appointment Confirmed",
    body_text:
      "Hi {{1}}, your appointment with {{2}} is confirmed for {{3}} at {{4}}. Please arrive 10 minutes early. Reply RESCHEDULE if you need to change.",
    category: "UTILITY",
    industry_tags: ["healthcare"],
    variables: [
      { index: 1, label: "Patient Name", example: "Priya" },
      { index: 2, label: "Doctor Name", example: "Dr. Sharma" },
      { index: 3, label: "Date", example: "March 15" },
      { index: 4, label: "Time", example: "10:30 AM" },
    ],
  },
  {
    name: "health_appointment_reminder",
    display_name: "Appointment Reminder (24h)",
    body_text:
      "Reminder: Your appointment with {{1}} is tomorrow at {{2}}. Location: {{3}}. Reply CONFIRM to confirm or CANCEL if you can't make it.",
    category: "UTILITY",
    industry_tags: ["healthcare"],
    variables: [
      { index: 1, label: "Doctor Name", example: "Dr. Sharma" },
      { index: 2, label: "Time", example: "10:30 AM" },
      { index: 3, label: "Location", example: "Sunshine Clinic, MG Road" },
    ],
  },
  {
    name: "health_prescription_ready",
    display_name: "Prescription Ready",
    body_text:
      "Hi {{1}}, your prescription from Dr. {{2}} is ready. You can collect it from our pharmacy or we can arrange delivery. Reply to let us know.",
    category: "UTILITY",
    industry_tags: ["healthcare"],
    variables: [
      { index: 1, label: "Patient Name", example: "Priya" },
      { index: 2, label: "Doctor Name", example: "Sharma" },
    ],
  },
  {
    name: "health_lab_report",
    display_name: "Lab Report Ready",
    body_text:
      "Hi {{1}}, your lab reports are ready. Visit us to collect or reply to request a WhatsApp share. 📋",
    category: "UTILITY",
    industry_tags: ["healthcare"],
    variables: [{ index: 1, label: "Patient Name", example: "Priya" }],
  },
];

// ── Education ──────────────────────────────────────────────

const EDUCATION: SystemTemplate[] = [
  {
    name: "edu_admission_followup",
    display_name: "Admission Enquiry Follow Up",
    body_text:
      "Hi {{1}}! Thank you for your interest in {{2}}. We'd love to tell you more about our {{3}} program. Can we schedule a quick call?",
    category: "MARKETING",
    industry_tags: ["education"],
    variables: [
      { index: 1, label: "Parent/Student Name", example: "Priya" },
      { index: 2, label: "School Name", example: "Sunrise Academy" },
      { index: 3, label: "Program", example: "Grade 5" },
    ],
  },
  {
    name: "edu_fee_reminder",
    display_name: "Fee Reminder",
    body_text:
      "Dear {{1}}, this is a gentle reminder that your {{2}} fee of ₹{{3}} is due on {{4}}. Please pay to avoid any late charges. 📚",
    category: "UTILITY",
    industry_tags: ["education"],
    variables: [
      { index: 1, label: "Parent Name", example: "Mr. Gupta" },
      { index: 2, label: "Term", example: "Term 2" },
      { index: 3, label: "Amount", example: "25,000" },
      { index: 4, label: "Due Date", example: "March 15" },
    ],
  },
  {
    name: "edu_class_schedule",
    display_name: "Class Schedule",
    body_text:
      "Hi {{1}}, your {{2}} classes start on {{3}}. Time: {{4}} | Venue: {{5}}. We're excited to have you! 🎓",
    category: "UTILITY",
    industry_tags: ["education"],
    variables: [
      { index: 1, label: "Student Name", example: "Arjun" },
      { index: 2, label: "Course", example: "Math Tuition" },
      { index: 3, label: "Start Date", example: "March 10" },
      { index: 4, label: "Time", example: "4:00-5:30 PM" },
      { index: 5, label: "Venue", example: "Room 201" },
    ],
  },
  {
    name: "edu_result_notification",
    display_name: "Result Notification",
    body_text:
      "Hi {{1}}, your results for {{2}} are out! You scored {{3}}. View your detailed report card at the school office.",
    category: "UTILITY",
    industry_tags: ["education"],
    variables: [
      { index: 1, label: "Student Name", example: "Arjun" },
      { index: 2, label: "Exam", example: "Mid-Term" },
      { index: 3, label: "Score", example: "92%" },
    ],
  },
];

// ── Real Estate ────────────────────────────────────────────

const REALESTATE: SystemTemplate[] = [
  {
    name: "re_site_visit_confirmed",
    display_name: "Site Visit Confirmed",
    body_text:
      "Hi {{1}}, your site visit for {{2}} is confirmed for {{3}} at {{4}}. Our team will receive you at the site. For directions, tap here: {{5}}",
    category: "UTILITY",
    industry_tags: ["realestate"],
    variables: [
      { index: 1, label: "Customer Name", example: "Priya" },
      { index: 2, label: "Project Name", example: "Prestige Towers" },
      { index: 3, label: "Date", example: "March 15" },
      { index: 4, label: "Time", example: "11:00 AM" },
      { index: 5, label: "Map Link", example: "https://maps.google.com/..." },
    ],
  },
  {
    name: "re_property_match",
    display_name: "Property Match Alert",
    body_text:
      "Hi {{1}}, we found a property matching your requirements! {{2}} | {{3}} BHK | ₹{{4}} | {{5}}. Interested? Reply YES to schedule a visit.",
    category: "MARKETING",
    industry_tags: ["realestate"],
    variables: [
      { index: 1, label: "Customer Name", example: "Priya" },
      { index: 2, label: "Project", example: "Prestige Towers" },
      { index: 3, label: "BHK", example: "3" },
      { index: 4, label: "Price", example: "85,00,000" },
      { index: 5, label: "Location", example: "Whitefield, Bangalore" },
    ],
  },
  {
    name: "re_document_checklist",
    display_name: "Document Checklist",
    body_text:
      "Hi {{1}}, congratulations on your interest in {{2}}! Here are the documents you'll need: {{3}}. Reply if you have any questions.",
    category: "UTILITY",
    industry_tags: ["realestate"],
    variables: [
      { index: 1, label: "Customer Name", example: "Priya" },
      { index: 2, label: "Project", example: "Prestige Towers" },
      { index: 3, label: "Documents", example: "PAN, Aadhaar, Bank statements (6 months)" },
    ],
  },
  {
    name: "re_post_visit_followup",
    display_name: "Post-Visit Follow Up",
    body_text:
      "Hi {{1}}, thank you for visiting {{2}} today! What did you think? Reply with any questions. We're here to help you make the right decision. 🏠",
    category: "UTILITY",
    industry_tags: ["realestate"],
    variables: [
      { index: 1, label: "Customer Name", example: "Priya" },
      { index: 2, label: "Project", example: "Prestige Towers" },
    ],
  },
];

// ── Beauty / Salon ─────────────────────────────────────────

const BEAUTY: SystemTemplate[] = [
  {
    name: "beauty_appointment_reminder",
    display_name: "Appointment Reminder",
    body_text:
      "Hi {{1}}, your appointment at {{2}} is tomorrow at {{3}} for {{4}}. Looking forward to seeing you! Reply CANCEL if plans change. 💅",
    category: "UTILITY",
    industry_tags: ["beauty"],
    variables: [
      { index: 1, label: "Customer Name", example: "Priya" },
      { index: 2, label: "Salon Name", example: "Glow Studio" },
      { index: 3, label: "Time", example: "3:00 PM" },
      { index: 4, label: "Service", example: "Hair Color + Cut" },
    ],
  },
  {
    name: "beauty_birthday_offer",
    display_name: "Birthday Offer",
    body_text:
      "Happy Birthday {{1}}! 🎂 Treat yourself to our special birthday package - 20% off on any service this week. Book now, just reply to this message! 🎁",
    category: "MARKETING",
    industry_tags: ["beauty"],
    variables: [{ index: 1, label: "Customer Name", example: "Priya" }],
  },
  {
    name: "beauty_feedback",
    display_name: "After Service Feedback",
    body_text:
      "Hi {{1}}, we hope you loved your {{2}} session! We'd love to hear your feedback. Please rate us 1-5 ⭐",
    category: "UTILITY",
    industry_tags: ["beauty"],
    variables: [
      { index: 1, label: "Customer Name", example: "Priya" },
      { index: 2, label: "Service", example: "hair spa" },
    ],
  },
  {
    name: "beauty_membership_expiry",
    display_name: "Membership Expiry Reminder",
    body_text:
      "Hi {{1}}, your membership expires on {{2}}. Renew now to continue enjoying exclusive benefits! Reply RENEW to proceed. 💎",
    category: "MARKETING",
    industry_tags: ["beauty"],
    variables: [
      { index: 1, label: "Customer Name", example: "Priya" },
      { index: 2, label: "Expiry Date", example: "April 30" },
    ],
  },
];

// ── Fitness ────────────────────────────────────────────────

const FITNESS: SystemTemplate[] = [
  {
    name: "fitness_membership_renewal",
    display_name: "Membership Renewal",
    body_text:
      "Hi {{1}}, your fitness membership expires on {{2}}. Renew now for {{3}} and save {{4}}%! Reply RENEW or call us. 💪",
    category: "MARKETING",
    industry_tags: ["fitness"],
    variables: [
      { index: 1, label: "Member Name", example: "Priya" },
      { index: 2, label: "Expiry Date", example: "April 15" },
      { index: 3, label: "Plan", example: "Annual Plan" },
      { index: 4, label: "Discount %", example: "15" },
    ],
  },
  {
    name: "fitness_class_reminder",
    display_name: "Class Reminder",
    body_text:
      "Hi {{1}}, don't forget your {{2}} class tomorrow at {{3}} with {{4}}. See you there! 🏋️",
    category: "UTILITY",
    industry_tags: ["fitness"],
    variables: [
      { index: 1, label: "Member Name", example: "Priya" },
      { index: 2, label: "Class", example: "Yoga" },
      { index: 3, label: "Time", example: "7:00 AM" },
      { index: 4, label: "Trainer", example: "Coach Raj" },
    ],
  },
  {
    name: "fitness_missed_class",
    display_name: "Missed Class Follow-up",
    body_text:
      "Hi {{1}}, we missed you today at {{2}}! Is everything okay? Reply to reschedule or chat with us.",
    category: "UTILITY",
    industry_tags: ["fitness"],
    variables: [
      { index: 1, label: "Member Name", example: "Priya" },
      { index: 2, label: "Class", example: "Morning HIIT" },
    ],
  },
  {
    name: "fitness_goal_checkin",
    display_name: "30-Day Goal Check-in",
    body_text:
      "Hi {{1}}, it's been 30 days! How are you feeling about your fitness journey? Let's check in with your trainer. Reply to set an appointment.",
    category: "UTILITY",
    industry_tags: ["fitness"],
    variables: [{ index: 1, label: "Member Name", example: "Priya" }],
  },
];

// ── Combined library ───────────────────────────────────────

export const ALL_SYSTEM_TEMPLATES: SystemTemplate[] = [
  ...UNIVERSAL,
  ...FOOD,
  ...HEALTHCARE,
  ...EDUCATION,
  ...REALESTATE,
  ...BEAUTY,
  ...FITNESS,
];

export function getSystemTemplatesForIndustry(
  industry: Industry | string | null
): SystemTemplate[] {
  const universal = UNIVERSAL;
  if (!industry) return universal;

  const industrySpecific = ALL_SYSTEM_TEMPLATES.filter(
    (t) => t.industry_tags.length === 0 || t.industry_tags.includes(industry)
  );

  return industrySpecific;
}

export function getIndustryTemplatesOnly(industry: Industry | string): SystemTemplate[] {
  return ALL_SYSTEM_TEMPLATES.filter((t) => t.industry_tags.includes(industry));
}
