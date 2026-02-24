"use client";

import { useEffect, useState } from "react";
import { FeatureKey, hasFeature, normalizePlan } from "@/lib/feature-flags";

type Props = {
  feature: FeatureKey;
  title: string;
  children: React.ReactNode;
};

export default function FeatureGateCard({ feature, title, children }: Props) {
  const [plan, setPlan] = useState("starter");

  useEffect(() => {
    fetch("/api/usage/summary", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => setPlan(normalizePlan(String(j?.plan || "starter"))))
      .catch(() => setPlan("starter"));
  }, []);

  const enabled = hasFeature(plan, feature);

  if (enabled) return <>{children}</>;

  return (
    <section className="rounded-xl border border-amber-700 bg-amber-950/30 p-4 text-sm">
      <div className="mb-2 flex items-center gap-2 font-medium text-amber-300">
        <span aria-hidden>🔒</span>
        <span>{title} is a premium feature</span>
      </div>
      <p className="text-amber-200/90">
        Your current plan is <b>{plan}</b>. Upgrade to unlock {title.toLowerCase()}.
      </p>
      <a href="/dashboard/billing" className="mt-3 inline-flex min-h-[44px] items-center rounded-md border border-amber-500 px-3">
        Upgrade plan
      </a>
    </section>
  );
}
