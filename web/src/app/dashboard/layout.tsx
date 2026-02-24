import Link from "next/link";
import MobileBottomNav from "@/components/MobileBottomNav";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 pb-24 md:pb-6">
      <header className="mb-6">
        <nav className="flex flex-wrap gap-2">
          <Link href="/dashboard" className="inline-flex min-h-[44px] items-center px-3 py-1 rounded hover:bg-slate-800">Overview</Link>
          <Link href="/dashboard/widgets" className="inline-flex min-h-[44px] items-center px-3 py-1 rounded hover:bg-slate-800">Widget settings</Link>
          <Link href="/dashboard/templates" className="inline-flex min-h-[44px] items-center px-3 py-1 rounded hover:bg-slate-800">Templates</Link>
          <Link href="/dashboard/analytics" className="inline-flex min-h-[44px] items-center px-3 py-1 rounded hover:bg-slate-800">Analytics</Link>
          <Link href="/dashboard/billing" className="inline-flex min-h-[44px] items-center px-3 py-1 rounded hover:bg-slate-800">Billing</Link>
          {/* New explicit Docs tab */}
          <Link href="/docs" className="inline-flex min-h-[44px] items-center px-3 py-1 rounded border border-slate-700 hover:bg-slate-800">Docs</Link>
        </nav>
      </header>
      <main>{children}</main>
          <MobileBottomNav />
    </div>
  );
}