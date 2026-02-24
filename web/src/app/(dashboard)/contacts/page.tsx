"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import { ContactCard } from "./components/ContactCard";
import { ContactAvatar } from "@/components/shared/ContactAvatar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import type { Contact, LifecycleStage } from "@/types";

type ViewMode = "table" | "card" | "kanban";

const STATUS_OPTIONS = ["all", "new", "active", "follow_up", "lapsed", "converted", "blocked"];
const LIFECYCLE_STAGES: LifecycleStage[] = ["lead", "prospect", "customer", "vip", "churned"];

export default function ContactsPage() {
  const [view, setView] = useState<ViewMode>("table");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const supabase = getBrowserSupabase();

  const load = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("contacts")
      .select("*", { count: "exact" })
      .order("last_message_at", { ascending: false })
      .limit(50);

    if (search) {
      query = query.or(
        `name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%,wa_id.ilike.%${search}%`
      );
    }
    if (statusFilter !== "all") {
      query = query.eq("status", statusFilter);
    }

    const { data, count } = await query;
    setContacts((data as unknown as Contact[]) ?? []);
    setTotal(count ?? 0);
    setLoading(false);
  }, [supabase, search, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === contacts.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(contacts.map((c) => c.id)));
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b bg-white px-6 py-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Contacts</h1>
          <p className="text-sm text-gray-500">{total} contacts</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/contacts/import"
            className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Import CSV
          </Link>
          <button className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
            Add Contact
          </button>
        </div>
      </div>

      {/* Filters + view toggle */}
      <div className="flex flex-wrap items-center gap-3 border-b bg-white px-6 py-3">
        <input
          type="text"
          placeholder="Search name, phone, email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64 rounded-lg border px-3 py-2 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border px-3 py-2 text-sm"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s === "all" ? "All statuses" : s.replace("_", " ")}
            </option>
          ))}
        </select>
        <div className="ml-auto flex rounded-lg border">
          {(["table", "card", "kanban"] as ViewMode[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1.5 text-xs font-medium capitalize ${
                view === v ? "bg-gray-100 text-gray-900" : "text-gray-500"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 bg-green-50 px-6 py-2 text-sm">
          <span className="font-medium text-green-700">{selected.size} selected</span>
          <button className="rounded bg-white px-3 py-1 text-xs text-gray-600 shadow-sm hover:bg-gray-50">
            Add Tag
          </button>
          <button className="rounded bg-white px-3 py-1 text-xs text-gray-600 shadow-sm hover:bg-gray-50">
            Change Status
          </button>
          <button className="rounded bg-white px-3 py-1 text-xs text-gray-600 shadow-sm hover:bg-gray-50">
            Assign Agent
          </button>
          <button className="rounded bg-white px-3 py-1 text-xs text-gray-600 shadow-sm hover:bg-gray-50">
            Send Broadcast
          </button>
          <button
            onClick={() => setSelected(new Set())}
            className="ml-auto text-xs text-gray-400 hover:text-gray-600"
          >
            Clear
          </button>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-green-600" />
          </div>
        ) : contacts.length === 0 ? (
          <EmptyState
            title="No contacts yet"
            description="Contacts are created automatically when someone messages you via WhatsApp."
          />
        ) : view === "table" ? (
          <div className="overflow-x-auto rounded-xl border bg-white">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-xs text-gray-500">
                  <th className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.size === contacts.length}
                      onChange={toggleAll}
                    />
                  </th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Stage</th>
                  <th className="px-4 py-3">Tags</th>
                  <th className="px-4 py-3">Last Message</th>
                  <th className="px-4 py-3 text-right">Spend</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((c) => (
                  <tr key={c.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(c.id)}
                        onChange={() => toggleSelect(c.id)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/contacts/${c.id}`}
                        className="flex items-center gap-2 hover:underline"
                      >
                        <ContactAvatar name={c.name ?? c.wa_id} imageUrl={c.avatar_url} size="sm" />
                        <span className="font-medium text-gray-900">
                          {c.name ?? c.profile_name ?? c.wa_id}
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{c.phone}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={c.lifecycle_stage} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {c.tags.slice(0, 2).map((t) => (
                          <span
                            key={t}
                            className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600"
                          >
                            {t}
                          </span>
                        ))}
                        {c.tags.length > 2 && (
                          <span className="text-xs text-gray-400">+{c.tags.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {c.last_message_at
                        ? new Date(c.last_message_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                          })
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">
                      {Number(c.total_order_value) > 0
                        ? `₹${Number(c.total_order_value).toLocaleString("en-IN")}`
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : view === "card" ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {contacts.map((c) => (
              <ContactCard key={c.id} contact={c} />
            ))}
          </div>
        ) : (
          /* Kanban by lifecycle stage */
          <div className="flex gap-4 overflow-x-auto pb-4">
            {LIFECYCLE_STAGES.map((stage) => (
              <div key={stage} className="w-72 flex-shrink-0">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700 capitalize">
                  {stage}
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-normal text-gray-500">
                    {contacts.filter((c) => c.lifecycle_stage === stage).length}
                  </span>
                </h3>
                <div className="space-y-2">
                  {contacts
                    .filter((c) => c.lifecycle_stage === stage)
                    .map((c) => (
                      <ContactCard key={c.id} contact={c} />
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
