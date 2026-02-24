"use client";

import { useState, useEffect, useCallback } from "react";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import type { AnalyticsDaily } from "@/types";

type DateRange = "7d" | "30d" | "90d";

function pctChange(current: number, previous: number): string {
  if (previous === 0) return current > 0 ? "+100%" : "0%";
  const pct = ((current - previous) / previous) * 100;
  return `${pct > 0 ? "+" : ""}${pct.toFixed(0)}%`;
}

export default function AnalyticsPage() {
  const [range, setRange] = useState<DateRange>("30d");
  const [data, setData] = useState<AnalyticsDaily[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = getBrowserSupabase();

  const days = range === "7d" ? 7 : range === "90d" ? 90 : 30;

  const load = useCallback(async () => {
    setLoading(true);
    const since = new Date(Date.now() - days * 86400000)
      .toISOString()
      .split("T")[0];

    const { data: snapshots } = await supabase
      .from("analytics_daily")
      .select("*")
      .gte("date", since)
      .order("date", { ascending: true });

    setData((snapshots as unknown as AnalyticsDaily[]) ?? []);
    setLoading(false);
  }, [supabase, days]);

  useEffect(() => {
    load();
  }, [load]);

  const half = Math.floor(data.length / 2);
  const current = data.slice(half);
  const previous = data.slice(0, half);

  function sum(arr: AnalyticsDaily[], key: keyof AnalyticsDaily): number {
    return arr.reduce((acc, d) => acc + Number(d[key] ?? 0), 0);
  }

  const totalConversations = sum(current, "new_conversations");
  const prevConversations = sum(previous, "new_conversations");
  const totalMessages = sum(current, "messages_received") + sum(current, "messages_sent");
  const totalRevenue = sum(current, "revenue_logged");
  const prevRevenue = sum(previous, "revenue_logged");
  const totalContacts = sum(current, "new_contacts");
  const prevContacts = sum(previous, "new_contacts");

  const frtValues = current.filter((d) => d.avg_first_response_seconds > 0);
  const avgFrt =
    frtValues.length > 0
      ? Math.round(frtValues.reduce((a, d) => a + d.avg_first_response_seconds, 0) / frtValues.length)
      : 0;
  const avgFrtMins = Math.round(avgFrt / 60);

  const resolutionCount = sum(current, "resolved_conversations");
  const convoCount = sum(current, "new_conversations");
  const resolutionRate = convoCount > 0 ? Math.round((resolutionCount / convoCount) * 100) : 0;

  const broadcastMsgsSent = sum(current, "broadcast_messages_sent");

  const KPIs = [
    {
      label: "Total Conversations",
      value: totalConversations.toLocaleString(),
      change: pctChange(totalConversations, prevConversations),
      up: totalConversations >= prevConversations,
    },
    {
      label: "Avg First Response",
      value: avgFrtMins > 0 ? `${avgFrtMins}m` : "—",
      change: "",
      up: true,
    },
    {
      label: "Resolution Rate",
      value: `${resolutionRate}%`,
      change: "",
      up: resolutionRate >= 80,
    },
    {
      label: "Revenue",
      value: `₹${totalRevenue.toLocaleString("en-IN")}`,
      change: pctChange(totalRevenue, prevRevenue),
      up: totalRevenue >= prevRevenue,
    },
    {
      label: "New Contacts",
      value: totalContacts.toLocaleString(),
      change: pctChange(totalContacts, prevContacts),
      up: totalContacts >= prevContacts,
    },
    {
      label: "Broadcast Messages",
      value: broadcastMsgsSent.toLocaleString(),
      change: "",
      up: true,
    },
  ];

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b bg-white px-6 py-4">
        <h1 className="text-xl font-bold text-gray-900">Analytics</h1>
        <div className="flex items-center gap-2">
          {(["7d", "30d", "90d"] as DateRange[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                range === r
                  ? "bg-green-100 text-green-700"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {r === "7d" ? "7 Days" : r === "30d" ? "30 Days" : "90 Days"}
            </button>
          ))}
          <button className="ml-2 rounded-lg border px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50">
            Export
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-green-600" />
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {KPIs.map((kpi) => (
                <div
                  key={kpi.label}
                  className="rounded-xl border bg-white p-4"
                >
                  <p className="text-xs text-gray-500">{kpi.label}</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">
                    {kpi.value}
                  </p>
                  {kpi.change && (
                    <p
                      className={`mt-1 text-xs font-medium ${
                        kpi.up ? "text-green-600" : "text-red-500"
                      }`}
                    >
                      {kpi.change} vs prev period
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Charts area */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Conversations chart */}
              <div className="rounded-xl border bg-white p-5">
                <h3 className="mb-4 font-semibold text-gray-900">
                  Conversations Over Time
                </h3>
                <div className="space-y-2">
                  {current.map((d) => {
                    const maxVal = Math.max(
                      ...current.map((x) => x.new_conversations),
                      1,
                    );
                    const pct = (d.new_conversations / maxVal) * 100;
                    return (
                      <div key={d.date} className="flex items-center gap-2">
                        <span className="w-16 text-xs text-gray-500">
                          {new Date(d.date + "T00:00:00").toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                        <div className="flex-1">
                          <div
                            className="h-5 rounded bg-green-500"
                            style={{ width: `${Math.max(pct, 2)}%` }}
                          />
                        </div>
                        <span className="w-8 text-right text-xs font-medium text-gray-700">
                          {d.new_conversations}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Messages chart */}
              <div className="rounded-xl border bg-white p-5">
                <h3 className="mb-4 font-semibold text-gray-900">
                  Messages: Sent vs Received
                </h3>
                <div className="space-y-2">
                  {current.map((d) => {
                    const total = d.messages_received + d.messages_sent;
                    const maxTotal = Math.max(
                      ...current.map((x) => x.messages_received + x.messages_sent),
                      1,
                    );
                    const recvPct = (d.messages_received / maxTotal) * 100;
                    const sentPct = (d.messages_sent / maxTotal) * 100;
                    return (
                      <div key={d.date} className="flex items-center gap-2">
                        <span className="w-16 text-xs text-gray-500">
                          {new Date(d.date + "T00:00:00").toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                        <div className="flex flex-1 gap-0.5">
                          <div
                            className="h-5 rounded-l bg-blue-400"
                            style={{ width: `${Math.max(recvPct, 1)}%` }}
                            title={`Received: ${d.messages_received}`}
                          />
                          <div
                            className="h-5 rounded-r bg-green-400"
                            style={{ width: `${Math.max(sentPct, 1)}%` }}
                            title={`Sent: ${d.messages_sent}`}
                          />
                        </div>
                        <span className="w-8 text-right text-xs font-medium text-gray-700">
                          {total}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3 flex gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-blue-400" />{" "}
                    Received
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-green-400" />{" "}
                    Sent
                  </span>
                </div>
              </div>

              {/* Revenue trend */}
              <div className="rounded-xl border bg-white p-5">
                <h3 className="mb-4 font-semibold text-gray-900">
                  Revenue Trend
                </h3>
                <div className="space-y-2">
                  {current.map((d) => {
                    const rev = Number(d.revenue_logged);
                    const maxRev = Math.max(
                      ...current.map((x) => Number(x.revenue_logged)),
                      1,
                    );
                    const pct = (rev / maxRev) * 100;
                    return (
                      <div key={d.date} className="flex items-center gap-2">
                        <span className="w-16 text-xs text-gray-500">
                          {new Date(d.date + "T00:00:00").toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                        <div className="flex-1">
                          <div
                            className="h-5 rounded bg-amber-400"
                            style={{ width: `${Math.max(pct, 2)}%` }}
                          />
                        </div>
                        <span className="w-16 text-right text-xs font-medium text-gray-700">
                          ₹{rev.toLocaleString("en-IN")}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Contact funnel */}
              <div className="rounded-xl border bg-white p-5">
                <h3 className="mb-4 font-semibold text-gray-900">
                  Summary
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Total messages</span>
                    <span className="font-medium">{totalMessages.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Automations triggered</span>
                    <span className="font-medium">{sum(current, "automations_triggered").toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Templates sent</span>
                    <span className="font-medium">{sum(current, "templates_sent").toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Orders completed</span>
                    <span className="font-medium">{sum(current, "orders_completed").toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {data.length === 0 && (
              <div className="mt-8 text-center text-sm text-gray-500">
                No analytics data yet. Data populates automatically as
                conversations happen.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
