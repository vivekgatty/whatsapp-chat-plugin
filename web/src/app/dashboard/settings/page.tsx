import Link from "next/link";
import FeatureGateCard from "@/components/FeatureGateCard";

export default function SettingsPage() {
  return (
    <section className="space-y-4 px-2 py-3 text-sm">
      <div>Settings</div>
      <Link href="/dashboard/editprofile" className="inline-flex min-h-[44px] items-center rounded border border-slate-700 px-3">Edit profile</Link>
      <Link href="/dashboard/business" className="inline-flex min-h-[44px] items-center rounded border border-slate-700 px-3">Business</Link>

      <FeatureGateCard feature="DAILY_REPORT" title="Daily Report">
        <div className="rounded border border-slate-700 p-3">Daily Summary automation is enabled for your plan.</div>
      </FeatureGateCard>
    </section>
  );
}
