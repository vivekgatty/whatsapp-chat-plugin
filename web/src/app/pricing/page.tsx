export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = false;           // must be number or false
export const fetchCache = "force-no-store"; // belt & suspenders

export default function Pricing() {
  return (
    <main className="max-w-2xl mx-auto p-6 space-y-3">
      <h1 className="text-3xl font-semibold">Pricing</h1>
      <p className="text-sm text-zinc-400">Subscription management — placeholder.</p>
      <a href="/dashboard" className="inline-block rounded-md bg-emerald-600 text-white px-4 py-2">
        Back to dashboard
      </a>
    </main>
  );
}
