export const dynamic = "force-dynamic";
/** Edit Business Profile — stamp: 2025-11-01_09-17-27 */
async function fetchOverview() {
  const r = await fetch("/api/business/overview", { cache: "no-store" });
  try { return await r.json(); } catch { return {}; }
}
export default async function EditBusinessProfile() {
  const o = await fetchOverview();
  const biz = o?.business ?? {};
  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-semibold">Edit business profile</h1>

      <form method="post" action="/api/business/overview" className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Name</label>
          <input name="name" defaultValue={biz.name ?? ""} className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm mb-1">Website</label>
          <input name="website" defaultValue={biz.website ?? "https://chatmadi.com"} className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input name="email" defaultValue={biz.email ?? "admin@chatmadi.com"} className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm mb-1">Phone</label>
            <input name="phone" defaultValue={biz.phone ?? "9591428002"} className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2" />
          </div>
        </div>

        {/* Enable once POST endpoint is wired */}
        <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 rounded px-4 py-2" disabled>
          Save (enable once API is wired)
        </button>
      </form>

      <a href="/dashboard" className="text-sky-400 hover:underline">← Back to dashboard</a>
    </div>
  );
}