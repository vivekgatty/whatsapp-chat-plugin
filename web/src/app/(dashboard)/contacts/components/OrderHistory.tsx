"use client";

import type { Order } from "@/types";

interface Props {
  contactId: string;
}

export function OrderHistory({ contactId: _contactId }: Props) {
  // TODO: Fetch orders for this contact
  const orders: Order[] = [];

  return (
    <div className="rounded-xl border bg-white">
      <div className="border-b px-4 py-3">
        <h3 className="font-semibold text-gray-900">Order History</h3>
      </div>
      <div className="p-4">
        {orders.length === 0 ? (
          <p className="text-sm text-gray-500">No orders yet</p>
        ) : (
          <div className="space-y-2">
            {orders.map((order) => (
              <a
                key={order.id}
                href={`/orders/${order.id}`}
                className="block rounded-lg border p-3 hover:bg-gray-50"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{order.order_number}</span>
                  <span className="text-sm font-semibold text-gray-900">
                    ₹{Number(order.total_amount).toLocaleString("en-IN")}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  {order.status} · {order.payment_status}
                </p>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
