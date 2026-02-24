import { createClient } from "@/lib/supabase/server";

export default async function OverviewPage() {
  const supabase = createClient();

  const { data: workspace } = await supabase.from("workspaces").select("*").limit(1).single();

  const { count: openConversations } = await supabase
    .from("conversations")
    .select("id", { count: "exact", head: true })
    .eq("status", "open");

  const { count: totalContacts } = await supabase
    .from("contacts")
    .select("id", { count: "exact", head: true });

  const { count: pendingOrders } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .in("status", ["new", "confirmed", "in_progress"]);

  return (
    <div className="p-6">
      <h1 className="mb-2 text-2xl font-bold text-gray-900">
        Welcome back{workspace?.name ? `, ${workspace.name}` : ""}
      </h1>
      <p className="mb-8 text-sm text-gray-500">Here&apos;s what&apos;s happening today.</p>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Open Conversations", value: openConversations ?? 0, href: "/inbox" },
          { label: "Total Contacts", value: totalContacts ?? 0, href: "/contacts" },
          { label: "Active Orders", value: pendingOrders ?? 0, href: "/orders" },
          {
            label: "Plan",
            value: workspace?.plan?.toUpperCase() ?? "TRIAL",
            href: "/settings/billing",
          },
        ].map((stat) => (
          <a
            key={stat.label}
            href={stat.href}
            className="rounded-xl border bg-white p-5 transition-shadow hover:shadow-md"
          >
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{stat.value}</p>
          </a>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-white p-6">
          <h2 className="mb-4 font-semibold text-gray-900">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "New Broadcast", href: "/broadcasts/new" },
              { label: "View Analytics", href: "/analytics" },
              { label: "Manage Templates", href: "/templates" },
              { label: "Team Settings", href: "/settings/team" },
            ].map((action) => (
              <a
                key={action.label}
                href={action.href}
                className="rounded-lg border p-3 text-center text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                {action.label}
              </a>
            ))}
          </div>
        </div>

        <div className="rounded-xl border bg-white p-6">
          <h2 className="mb-4 font-semibold text-gray-900">Getting Started</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <p>1. Connect your WhatsApp Business account</p>
            <p>2. Create your first message template</p>
            <p>3. Invite your team members</p>
            <p>4. Set up automation rules</p>
            <p>5. Send your first broadcast</p>
          </div>
        </div>
      </div>
    </div>
  );
}
