export const ALLOWED_TRIGGER_TYPES = ["manual","url_param","utm","path_match"] as const;
export type TriggerType = typeof ALLOWED_TRIGGER_TYPES[number];

export type CustomTrigger = {
  id: string;
  business_id: string;
  code: string;
  label: string;
  type: TriggerType;
  matchers: Record<string, unknown>;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type ListResponse = {
  items: CustomTrigger[];
  can_write: boolean;
  allowed_types: readonly TriggerType[];
  error?: string;
};

export async function listCustomTriggers(params?: { business_id?: string; activeOnly?: boolean }) {
  const qs = new URLSearchParams();
  if (params?.business_id) qs.set("business_id", params.business_id);
  if (params?.activeOnly) qs.set("active", "1");
  const r = await fetch(`/api/triggers${qs.toString() ? "?" + qs.toString() : ""}`, { cache: "no-store" });
  return (await r.json()) as ListResponse;
}

export function validateCode(code: string): string | null {
  if (!/^[a-z0-9_]{3,30}$/.test(code)) return "Use 3–30 chars: a-z, 0-9, underscore.";
  return null;
}

export function sampleMatchers(type: TriggerType): string {
  switch (type) {
    case "manual":
      return JSON.stringify({ via: "intent_param_or_widget_setting" }, null, 2);
    case "url_param":
      return JSON.stringify({ key: "intent", value: "offers" }, null, 2);
    case "utm":
      return JSON.stringify({ campaign: "diwali2025", source: "google" }, null, 2);
    case "path_match":
      return JSON.stringify({ regex: "^/product/.+" }, null, 2);
    default:
      return "{}";
  }
}