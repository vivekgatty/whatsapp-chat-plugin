import Link from "next/link";

export default function SettingsPage() {
  return (
    <section className="space-y-3 px-2 py-3 text-sm">
      <div>Settings</div>
      <Link href="/dashboard/editprofile" className="inline-flex min-h-[44px] items-center rounded border border-slate-700 px-3">Edit profile</Link>
      <Link href="/dashboard/business" className="inline-flex min-h-[44px] items-center rounded border border-slate-700 px-3">Business</Link>
    </section>
  );
}
