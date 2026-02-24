"use client";

import { useState, useEffect, useCallback } from "react";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import { OrderCard } from "./components/OrderCard";
import { EmptyState } from "@/components/shared/EmptyState";
import type { Order } from "@/types";

type ViewMode = "kanban" | "table";

const DEFAULT_COLUMNS = ["new", "confirmed", "in_progress", "completed", "cancelled"];
const FOOD_COLUMNS = ["new", "preparing", "ready", "out_for_delivery", "delivered"];
const HEALTHCARE_COLUMNS = [
  "scheduled",
  "checked_in",
  "in_consultation",
  "prescription_sent",
  "completed",
];

function getColumns(industry: string | null): string[] {
  switch (industry) {
    case "food":
      return FOOD_COLUMNS;
    case "healthcare":
      return HEALTHCARE_COLUMNS;
    default:
      return DEFAULT_COLUMNS;
  }
}

export default function OrdersPage() {
  const [view, setView] = useState<ViewMode>("kanban");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [industry, setIndustry] = useState<string | null>(null);
  const supabase = getBrowserSupabase();

  const load = useCallback(async () => {
    setLoading(true);
    const { data: ws } = await supabase.from("workspaces").select("industry").limit(1).single();
    setIndustry(ws?.industry ?? null);

    const { data } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);

    setOrders((data as unknown as Order[]) ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    load();
  }, [load]);

  const columns = getColumns(industry);

  async function handleDrop(orderId: string, newStatus: string) {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
    await supabase.from("orders").update({ status: newStatus }).eq("id", orderId);
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b bg-white px-6 py-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500">{orders.length} orders</p>
        </div>
        <div className="flex gap-2">
          <div className="flex rounded-lg border">
            <button
              onClick={() => setView("kanban")}
              className={`px-3 py-1.5 text-xs font-medium ${view === "kanban" ? "bg-gray-100 text-gray-900" : "text-gray-500"}`}
            >
              Kanban
            </button>
            <button
              onClick={() => setView("table")}
              className={`px-3 py-1.5 text-xs font-medium ${view === "table" ? "bg-gray-100 text-gray-900" : "text-gray-500"}`}
            >
              Table
            </button>
          </div>
          <button className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
            New Order
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-green-600" />
          </div>
        ) : orders.length === 0 ? (
          <EmptyState
            title="No orders yet"
            description="Create orders from conversations or add them manually."
          />
        ) : view === "kanban" ? (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {columns.map((col) => {
              const colOrders = orders.filter((o) => o.status === col);
              return (
                <div
                  key={col}
                  className="w-72 flex-shrink-0"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    const id = e.dataTransfer.getData("orderId");
                    if (id) handleDrop(id, col);
                  }}
                >
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700 capitalize">
                    {col.replace(/_/g, " ")}
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-normal text-gray-500">
                      {colOrders.length}
                    </span>
                  </h3>
                  <div className="space-y-2">
                    {colOrders.map((order) => (
                      <div
                        key={order.id}
                        draggable
                        onDragStart={(e) => e.dataTransfer.setData("orderId", order.id)}
                      >
                        <OrderCard order={order} compact />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border bg-white">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-xs text-gray-500">
                  <th className="px-4 py-3">Order #</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr
                    key={o.id}
                    className="cursor-pointer border-b last:border-0 hover:bg-gray-50"
                    onClick={() => (window.location.href = `/orders/${o.id}`)}
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">{o.order_number}</td>
                    <td className="px-4 py-3 text-gray-600">{o.title ?? o.order_type}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 capitalize">
                        {o.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 capitalize">
                        {o.payment_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">
                      ₹{Number(o.total_amount).toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {new Date(o.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
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
