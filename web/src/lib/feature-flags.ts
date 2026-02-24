export const FEATURES = {
  BROADCASTS: ["growth", "pro", "enterprise"],
  AUTOMATIONS: ["growth", "pro", "enterprise"],
  CATALOG: ["growth", "pro", "enterprise"],
  ORDERS: ["growth", "pro", "enterprise"],
  API_ACCESS: ["pro", "enterprise"],
  CUSTOM_WEBHOOKS: ["pro", "enterprise"],
  MULTI_AGENT: ["growth", "pro", "enterprise"],
  DAILY_REPORT: ["growth", "pro", "enterprise"],
  PAYMENT_LINKS: ["growth", "pro", "enterprise"],
  CSV_IMPORT: ["growth", "pro", "enterprise"],
  WHITE_LABEL: ["enterprise"],
} as const;

export type FeatureKey = keyof typeof FEATURES;

export function normalizePlan(plan: string | null | undefined): string {
  const p = String(plan || "starter").toLowerCase();
  if (["business", "paid"].includes(p)) return "pro";
  if (["starter", "free"].includes(p)) return "starter";
  return p;
}

export function hasFeature(plan: string, feature: FeatureKey): boolean {
  return (FEATURES[feature] as readonly string[]).includes(normalizePlan(plan));
}
