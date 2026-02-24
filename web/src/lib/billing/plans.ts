import type { PlanTier } from "@/types";

export interface PlanDefinition {
  tier: PlanTier;
  name: string;
  price: number;
  priceDisplay: string;
  conversations: number;
  conversationsDisplay: string;
  agents: number;
  agentsDisplay: string;
  broadcastsPerMonth: number;
  broadcastsDisplay: string;
  automations: number;
  automationsDisplay: string;
  features: string[];
  popular?: boolean;
}

export const PLANS: PlanDefinition[] = [
  {
    tier: "starter",
    name: "Starter",
    price: 999,
    priceDisplay: "₹999",
    conversations: 500,
    conversationsDisplay: "500",
    agents: 1,
    agentsDisplay: "1",
    broadcastsPerMonth: 2,
    broadcastsDisplay: "2/month",
    automations: 3,
    automationsDisplay: "3",
    features: [
      "Shared inbox",
      "Message templates",
      "Quick replies",
      "Contact management",
      "Widget embed",
      "Email support",
    ],
  },
  {
    tier: "growth",
    name: "Growth",
    price: 1999,
    priceDisplay: "₹1,999",
    conversations: 2000,
    conversationsDisplay: "2,000",
    agents: 3,
    agentsDisplay: "3",
    broadcastsPerMonth: 10,
    broadcastsDisplay: "10/month",
    automations: 10,
    automationsDisplay: "10",
    popular: true,
    features: [
      "Everything in Starter",
      "Automation engine",
      "Product catalog",
      "Order management",
      "Daily analytics report",
      "CSV import/export",
      "Priority email support",
    ],
  },
  {
    tier: "pro",
    name: "Pro",
    price: 3499,
    priceDisplay: "₹3,499",
    conversations: 5000,
    conversationsDisplay: "5,000",
    agents: 10,
    agentsDisplay: "10",
    broadcastsPerMonth: -1,
    broadcastsDisplay: "Unlimited",
    automations: -1,
    automationsDisplay: "Unlimited",
    features: [
      "Everything in Growth",
      "Unlimited broadcasts",
      "Unlimited automations",
      "API access",
      "Custom webhooks",
      "Advanced analytics",
      "Priority chat support",
    ],
  },
  {
    tier: "enterprise",
    name: "Enterprise",
    price: 9999,
    priceDisplay: "₹9,999",
    conversations: -1,
    conversationsDisplay: "Unlimited",
    agents: -1,
    agentsDisplay: "Unlimited",
    broadcastsPerMonth: -1,
    broadcastsDisplay: "Unlimited",
    automations: -1,
    automationsDisplay: "Unlimited",
    features: [
      "Everything in Pro",
      "Unlimited conversations",
      "Unlimited agents",
      "SLA guarantee",
      "Dedicated onboarding",
      "Custom integrations",
      "White-label option",
      "Dedicated account manager",
    ],
  },
];

export const TRIAL_PLAN: PlanDefinition = {
  tier: "trial",
  name: "Free Trial",
  price: 0,
  priceDisplay: "Free",
  conversations: 100,
  conversationsDisplay: "100",
  agents: 1,
  agentsDisplay: "1",
  broadcastsPerMonth: 1,
  broadcastsDisplay: "1/month",
  automations: 2,
  automationsDisplay: "2",
  features: ["14-day trial", "All Growth features", "No credit card required"],
};

export function getPlanByTier(tier: PlanTier | string): PlanDefinition {
  return PLANS.find((p) => p.tier === tier) ?? TRIAL_PLAN;
}

export function getConversationLimit(tier: PlanTier | string): number {
  const plan = getPlanByTier(tier);
  return plan.conversations === -1 ? Infinity : plan.conversations;
}

export function getBroadcastLimit(tier: PlanTier | string): number {
  const plan = getPlanByTier(tier);
  return plan.broadcastsPerMonth === -1 ? Infinity : plan.broadcastsPerMonth;
}

export function getAgentLimit(tier: PlanTier | string): number {
  const plan = getPlanByTier(tier);
  return plan.agents === -1 ? Infinity : plan.agents;
}

export function getAutomationLimit(tier: PlanTier | string): number {
  const plan = getPlanByTier(tier);
  return plan.automations === -1 ? Infinity : plan.automations;
}
