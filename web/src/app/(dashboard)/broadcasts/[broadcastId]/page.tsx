import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { StatusBadge } from "@/components/shared/StatusBadge";

interface Props {
  params: Promise<{ broadcastId: string }>;
}

export default async function BroadcastDetailPage({ params }: Props) {
  const { broadcastId } = await params;
  const supabase = createClient();

  const { data: broadcast } = await supabase
    .from("broadcasts")
    .select("*")
    .eq("id", broadcastId)
    .single();

  if (!broadcast) redirect("/broadcasts");

  const deliveryRate =
    broadcast.total_sent > 0
      ? ((broadcast.total_delivered / broadcast.total_sent) * 100).toFixed(1)
      : "0";
  const readRate =
    broadcast.total_delivered > 0
      ? ((broadcast.total_read / broadcast.total_delivered) * 100).toFixed(1)
      : "0";

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{broadcast.name}</h1>
          <StatusBadge status={broadcast.status} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: "Sent", value: broadcast.total_sent },
          { label: "Delivered", value: `${broadcast.total_delivered} (${deliveryRate}%)` },
          { label: "Read", value: `${broadcast.total_read} (${readRate}%)` },
          { label: "Replied", value: broadcast.total_replied },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border bg-white p-4">
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="text-xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
