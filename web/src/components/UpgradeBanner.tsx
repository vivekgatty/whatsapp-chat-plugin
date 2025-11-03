"use client";

export default function UpgradeBanner({ show }: { show?: boolean }) {
  if (!show) return null;
  return (
    <div className="mb-4 rounded-md border border-yellow-600 bg-yellow-900/30 p-3 text-sm">
      <b>Limit reached:</b> You’ve hit the Free plan monthly quota.{" "}
      <a className="text-emerald-400 underline" href="/dashboard/billing">
        Upgrade to Pro
      </a>{" "}
      to continue without interruption.
    </div>
  );
}
