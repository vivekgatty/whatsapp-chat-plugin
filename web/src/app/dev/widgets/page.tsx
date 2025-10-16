// src/app/dev/widgets/page.tsx
export const dynamic = "force-dynamic";

type Widget = {
  id: string;
  business_id: string;
  cta_text: string | null;
  position: string | null;
  created_at: string;
};

export default async function Page() {
  const res = await fetch("http://localhost:3000/api/dev/widgets", { cache: "no-store" });
  const json = await res.json();

  if (!json?.ok) {
    return (
      <main className="p-8 space-y-4">
        <h1 className="text-2xl font-semibold">Dev: Widgets</h1>
        <pre className="text-red-600 bg-red-50 p-4 rounded">
{JSON.stringify(json, null, 2)}
        </pre>
      </main>
    );
  }

  const widgets: Widget[] = json.widgets ?? [];

  return (
    <main className="p-8 space-y-6">
      <h1 className="text-2xl font-semibold">Dev: Widgets</h1>
      <p className="text-sm text-gray-600">Listing the latest widgets from Supabase.</p>

      <ul className="space-y-3">
        {widgets.map((w) => (
          <li key={w.id} className="border rounded p-3">
            <div><span className="font-mono text-xs">{w.id}</span></div>
            <div>CTA: <strong>{w.cta_text ?? "—"}</strong></div>
            <div>Position: {w.position ?? "—"}</div>
            <div className="text-xs text-gray-500">Business: {w.business_id}</div>
            <div className="text-xs text-gray-500">Created: {new Date(w.created_at).toLocaleString()}</div>
          </li>
        ))}
      </ul>

      <a href="/" className="text-blue-600 underline">← Back to Home</a>
    </main>
  );
}
