import type { Industry } from "@/types";

export interface CustomFieldDefinition {
  key: string;
  label: string;
  type: "text" | "number" | "date" | "dropdown" | "boolean";
  options?: string[];
}

export const INDUSTRY_CUSTOM_FIELDS: Record<string, CustomFieldDefinition[]> = {
  food: [
    {
      key: "dietary_preference",
      label: "Dietary Preference",
      type: "dropdown",
      options: ["Veg", "Non-Veg", "Vegan", "Jain"],
    },
    { key: "delivery_address", label: "Delivery Address", type: "text" },
    { key: "favorite_items", label: "Favorite Items", type: "text" },
    { key: "allergy_notes", label: "Allergy Notes", type: "text" },
  ],
  healthcare: [
    { key: "patient_id", label: "Patient ID", type: "text" },
    { key: "date_of_birth", label: "Date of Birth", type: "date" },
    {
      key: "blood_group",
      label: "Blood Group",
      type: "dropdown",
      options: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
    },
    { key: "insurance_provider", label: "Insurance Provider", type: "text" },
    { key: "referring_doctor", label: "Referring Doctor", type: "text" },
    { key: "medical_conditions", label: "Known Conditions", type: "text" },
    { key: "last_visit_date", label: "Last Visit Date", type: "date" },
    {
      key: "appointment_reminder_preference",
      label: "Reminder Preference",
      type: "dropdown",
      options: ["24h before", "2h before", "Both"],
    },
  ],
  education: [
    { key: "student_class", label: "Class/Grade", type: "text" },
    { key: "school_name", label: "School Name", type: "text" },
    { key: "parent_name", label: "Parent Name", type: "text" },
    { key: "parent_phone", label: "Parent Phone", type: "text" },
    { key: "enrolled_courses", label: "Enrolled Courses", type: "text" },
    { key: "fee_due_date", label: "Fee Due Date", type: "date" },
    {
      key: "board",
      label: "Board",
      type: "dropdown",
      options: ["CBSE", "ICSE", "State Board", "IB", "IGCSE"],
    },
  ],
  retail: [
    { key: "preferred_brands", label: "Preferred Brands", type: "text" },
    {
      key: "size_clothing",
      label: "Clothing Size",
      type: "dropdown",
      options: ["XS", "S", "M", "L", "XL", "XXL", "3XL"],
    },
    { key: "size_footwear", label: "Footwear Size", type: "text" },
    { key: "anniversary_date", label: "Anniversary Date", type: "date" },
    { key: "birthday", label: "Birthday", type: "date" },
    {
      key: "referral_source",
      label: "How did they find you",
      type: "dropdown",
      options: ["Instagram", "WhatsApp", "Word of mouth", "Google", "Facebook"],
    },
  ],
  realestate: [
    { key: "budget_min", label: "Budget Min (₹)", type: "number" },
    { key: "budget_max", label: "Budget Max (₹)", type: "number" },
    {
      key: "property_type",
      label: "Property Type",
      type: "dropdown",
      options: ["Apartment", "Villa", "Plot", "Commercial", "Office", "Warehouse"],
    },
    {
      key: "bhk_requirement",
      label: "BHK Requirement",
      type: "dropdown",
      options: ["1 BHK", "2 BHK", "3 BHK", "4 BHK", "4+ BHK"],
    },
    { key: "preferred_localities", label: "Preferred Localities", type: "text" },
    {
      key: "purpose",
      label: "Purpose",
      type: "dropdown",
      options: ["Self-use", "Investment", "Rental"],
    },
    {
      key: "financing",
      label: "Financing",
      type: "dropdown",
      options: ["Home loan", "Cash", "Both"],
    },
    {
      key: "possession_timeline",
      label: "Possession Timeline",
      type: "dropdown",
      options: ["Immediate", "3-6 months", "6-12 months", "1+ year", "Flexible"],
    },
    { key: "rera_requirement", label: "RERA Only", type: "boolean" },
  ],
  beauty: [
    {
      key: "skin_type",
      label: "Skin Type",
      type: "dropdown",
      options: ["Oily", "Dry", "Combination", "Sensitive", "Normal"],
    },
    { key: "hair_type", label: "Hair Type", type: "text" },
    { key: "preferred_stylist", label: "Preferred Stylist", type: "text" },
    { key: "birthday", label: "Birthday", type: "date" },
    { key: "last_service", label: "Last Service", type: "text" },
    { key: "allergies", label: "Product Allergies", type: "text" },
    { key: "membership_number", label: "Membership Number", type: "text" },
  ],
  finance: [
    { key: "annual_income", label: "Annual Income (₹)", type: "number" },
    {
      key: "employment_type",
      label: "Employment Type",
      type: "dropdown",
      options: ["Salaried", "Self-employed", "Business owner", "Retired", "Other"],
    },
    { key: "existing_loans", label: "Existing Loans", type: "text" },
    { key: "credit_score", label: "Credit Score (approx)", type: "number" },
    {
      key: "product_interest",
      label: "Product Interest",
      type: "dropdown",
      options: [
        "Home Loan",
        "Personal Loan",
        "Business Loan",
        "Car Loan",
        "Credit Card",
        "Insurance",
        "Mutual Fund",
        "FD",
      ],
    },
    { key: "pan_number", label: "PAN Number", type: "text" },
    {
      key: "kyc_status",
      label: "KYC Status",
      type: "dropdown",
      options: ["Pending", "In Progress", "Completed", "Rejected"],
    },
  ],
  logistics: [
    {
      key: "vehicle_type",
      label: "Vehicle Type",
      type: "dropdown",
      options: ["Bike", "Auto", "Mini Truck", "Truck", "Container"],
    },
    { key: "pickup_city", label: "Regular Pickup City", type: "text" },
    { key: "delivery_city", label: "Regular Delivery City", type: "text" },
    { key: "commodity_type", label: "Commodity Type", type: "text" },
    { key: "monthly_shipments", label: "Monthly Shipments (approx)", type: "number" },
    { key: "gst_number", label: "GST Number", type: "text" },
  ],
  hospitality: [
    { key: "room_preference", label: "Room Preference", type: "text" },
    {
      key: "bed_type",
      label: "Bed Type",
      type: "dropdown",
      options: ["Single", "Double", "Twin", "King", "Suite"],
    },
    { key: "nationality", label: "Nationality", type: "text" },
    { key: "passport_number", label: "Passport/ID Number", type: "text" },
    {
      key: "loyalty_tier",
      label: "Loyalty Tier",
      type: "dropdown",
      options: ["Standard", "Silver", "Gold", "Platinum"],
    },
    { key: "special_requests", label: "Special Requests", type: "text" },
    { key: "birthday", label: "Birthday", type: "date" },
    { key: "anniversary", label: "Anniversary", type: "date" },
  ],
  legal: [
    {
      key: "case_type",
      label: "Case Type",
      type: "dropdown",
      options: ["Civil", "Criminal", "Family", "Property", "Corporate", "Labour", "IPR", "Other"],
    },
    { key: "case_number", label: "Case Number", type: "text" },
    { key: "court", label: "Court", type: "text" },
    { key: "next_hearing_date", label: "Next Hearing Date", type: "date" },
    { key: "retainer_amount", label: "Retainer Amount (₹)", type: "number" },
    { key: "opposing_counsel", label: "Opposing Counsel", type: "text" },
  ],
  fitness: [
    {
      key: "membership_plan",
      label: "Membership Plan",
      type: "dropdown",
      options: ["Monthly", "Quarterly", "Half-yearly", "Annual"],
    },
    { key: "membership_expiry", label: "Membership Expiry", type: "date" },
    {
      key: "fitness_goal",
      label: "Fitness Goal",
      type: "dropdown",
      options: ["Weight Loss", "Muscle Gain", "Endurance", "Flexibility", "General Fitness"],
    },
    { key: "preferred_trainer", label: "Preferred Trainer", type: "text" },
    { key: "health_conditions", label: "Health Conditions", type: "text" },
    { key: "emergency_contact", label: "Emergency Contact", type: "text" },
    { key: "batch_time", label: "Preferred Batch Time", type: "text" },
  ],
  events: [
    {
      key: "event_type",
      label: "Event Type",
      type: "dropdown",
      options: ["Wedding", "Birthday", "Corporate", "Conference", "Concert", "Exhibition", "Other"],
    },
    { key: "event_date", label: "Event Date", type: "date" },
    { key: "guest_count", label: "Expected Guests", type: "number" },
    { key: "venue", label: "Venue", type: "text" },
    { key: "budget_total", label: "Total Budget (₹)", type: "number" },
    { key: "theme", label: "Theme/Style", type: "text" },
  ],
  auto: [
    { key: "vehicle_make", label: "Vehicle Make", type: "text" },
    { key: "vehicle_model", label: "Vehicle Model", type: "text" },
    { key: "vehicle_year", label: "Manufacturing Year", type: "number" },
    { key: "registration_number", label: "Registration Number", type: "text" },
    { key: "last_service_date", label: "Last Service Date", type: "date" },
    { key: "insurance_expiry", label: "Insurance Expiry", type: "date" },
    { key: "service_type", label: "Service Type Required", type: "text" },
  ],
};

export function getCustomFieldsForIndustry(
  industry: Industry | string | null
): CustomFieldDefinition[] {
  if (!industry) return [];
  return INDUSTRY_CUSTOM_FIELDS[industry] ?? [];
}
