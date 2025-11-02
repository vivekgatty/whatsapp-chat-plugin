export const dynamic = "force-dynamic";
export const revalidate = 0;

import AnalyticsClient from "../../../components/analytics/AnalyticsClient";
import { getSupabaseServer } from "../../../lib/supabaseServer";

export default async function AnalyticsPage() {
  const supa = await getSupabaseServer();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) {
    return <div className="p-4 text-red-300">Please sign in to view analytics.</div>;
  }

  let widgetId: string | null = null;
  const { data: w } = await supa
    .from("widgets")
    .select("id")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (w?.id) widgetId = w.id as string;

  if (!widgetId) {
    return <div className="p-4 text-slate-300">No widget found. Create a widget to see analytics.</div>;
  }

  return (
    <div className="p-4">
      <AnalyticsClient widgetId={widgetId} initialDays={14} />
    </div>
  );
}