import { createClient } from "@/lib/supabase/server";

export default async function AnalyticsPage() {
  const supabase = createClient();

  const { data: snapshots } = await supabase
    .from("analytics_daily")
    .select("*")
    .order("date", { ascending: false })
    .limit(30);

  const totals = (snapshots ?? []).reduce(
    (acc, s) => ({
      conversations: acc.conversations + (s.new_conversations ?? 0),
      messages: acc.messages + (s.messages_received ?? 0) + (s.messages_sent ?? 0),
      contacts: acc.contacts + (s.new_contacts ?? 0),
      revenue: acc.revenue + Number(s.revenue_logged ?? 0),
    }),
    { conversations: 0, messages: 0, contacts: 0, revenue: 0 }
  );

  return (
    <div className="p-6">
      <h1 className="mb-2 text-2xl font-bold text-gray-900">Analytics</h1>
      <p className="mb-6 text-sm text-gray-500">Last 30 days overview</p>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "New Conversations", value: totals.conversations },
          { label: "Messages", value: totals.messages },
          { label: "New Contacts", value: totals.contacts },
          {
            label: "Revenue",
            value: `₹${totals.revenue.toLocaleString("en-IN")}`,
          },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border bg-white p-5">
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Daily Breakdown</h2>
        {!snapshots || snapshots.length === 0 ? (
          <p className="text-sm text-gray-500">
            No analytics data yet. Data populates as conversations happen.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-xs text-gray-500">
                  <th className="pr-4 pb-2">Date</th>
                  <th className="pr-4 pb-2">Conversations</th>
                  <th className="pr-4 pb-2">Messages</th>
                  <th className="pr-4 pb-2">Contacts</th>
                  <th className="pr-4 pb-2">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {snapshots.map((s) => (
                  <tr key={s.id} className="border-b last:border-0">
                    <td className="py-2 pr-4 text-gray-900">{s.date}</td>
                    <td className="py-2 pr-4">{s.new_conversations}</td>
                    <td className="py-2 pr-4">
                      {(s.messages_received ?? 0) + (s.messages_sent ?? 0)}
                    </td>
                    <td className="py-2 pr-4">{s.new_contacts}</td>
                    <td className="py-2 pr-4">
                      ₹{Number(s.revenue_logged ?? 0).toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
