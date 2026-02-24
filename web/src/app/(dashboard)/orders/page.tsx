"use client";

import { useState } from "react";
import { OrderCard } from "./components/OrderCard";
import { EmptyState } from "@/components/shared/EmptyState";
import type { Order } from "@/types";

type ViewMode = "list" | "kanban";

const STATUS_COLUMNS = ["new", "confirmed", "in_progress", "completed", "cancelled"];

export default function OrdersPage() {
  const [view, setView] = useState<ViewMode>("list");
  // TODO: Fetch orders with pagination
  const orders: Order[] = [];

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500">{orders.length} total orders</p>
        </div>
        <div className="flex gap-2">
          <div className="flex rounded-lg border">
            <button
              onClick={() => setView("list")}
              className={`px-3 py-1.5 text-xs font-medium ${view === "list" ? "bg-gray-100 text-gray-900" : "text-gray-500"}`}
            >
              List
            </button>
            <button
              onClick={() => setView("kanban")}
              className={`px-3 py-1.5 text-xs font-medium ${view === "kanban" ? "bg-gray-100 text-gray-900" : "text-gray-500"}`}
            >
              Kanban
            </button>
          </div>
          <button className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
            New Order
          </button>
        </div>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          description="Create orders from conversations or add them manually."
        />
      ) : view === "list" ? (
        <div className="space-y-3">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STATUS_COLUMNS.map((status) => (
            <div key={status} className="w-72 flex-shrink-0">
              <h3 className="mb-3 text-sm font-semibold text-gray-700 capitalize">
                {status.replace("_", " ")}
              </h3>
              <div className="space-y-2">
                {orders
                  .filter((o) => o.status === status)
                  .map((order) => (
                    <OrderCard key={order.id} order={order} compact />
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
