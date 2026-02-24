import { StatusBadge } from "@/components/shared/StatusBadge";
import type { Order } from "@/types";

interface Props {
  order: Order;
  compact?: boolean;
}

export function OrderCard({ order, compact }: Props) {
  return (
    <a
      href={`/orders/${order.id}`}
      className={`block rounded-xl border bg-white transition-shadow hover:shadow-md ${compact ? "p-3" : "p-4"}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-900">{order.order_number}</span>
        <StatusBadge status={order.status} />
      </div>
      {order.title && <p className="mt-1 text-sm text-gray-600">{order.title}</p>}
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-gray-500">
          {order.payment_status} · {order.payment_method ?? "unpaid"}
        </span>
        <span className="text-sm font-semibold text-gray-900">
          ₹{Number(order.total_amount).toLocaleString("en-IN")}
        </span>
      </div>
    </a>
  );
}
