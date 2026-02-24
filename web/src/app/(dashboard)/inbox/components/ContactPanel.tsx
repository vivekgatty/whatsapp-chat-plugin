"use client";

import { useState, useEffect, useCallback } from "react";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import { ContactAvatar } from "@/components/shared/ContactAvatar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { Contact } from "@/types";

interface Props {
  contactId?: string | null;
  conversationId?: string | null;
  onBack?: () => void;
}

type Tab = "info" | "orders" | "timeline" | "automations";

export function ContactPanel({ contactId, conversationId, onBack }: Props) {
  const [contact, setContact] = useState<Contact | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("info");
  const [loading, setLoading] = useState(false);
  const supabase = getBrowserSupabase();

  const loadContact = useCallback(async () => {
    const id = contactId;
    if (!id && !conversationId) return;

    setLoading(true);
    let resolvedId = id;

    if (!resolvedId && conversationId) {
      const { data: convo } = await supabase
        .from("conversations")
        .select("contact_id")
        .eq("id", conversationId)
        .single();
      resolvedId = convo?.contact_id ?? null;
    }

    if (!resolvedId) {
      setLoading(false);
      return;
    }

    const { data } = await supabase.from("contacts").select("*").eq("id", resolvedId).single();

    setContact(data as unknown as Contact);
    setLoading(false);
  }, [supabase, contactId, conversationId]);

  useEffect(() => {
    loadContact();
  }, [loadContact]);

  if (!contactId && !conversationId) {
    return (
      <aside className="flex h-full items-center justify-center border-l bg-white">
        <p className="text-sm text-gray-400">No contact selected</p>
      </aside>
    );
  }

  if (loading || !contact) {
    return (
      <aside className="flex h-full items-center justify-center border-l bg-white">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-green-600" />
      </aside>
    );
  }

  const TABS: { key: Tab; label: string }[] = [
    { key: "info", label: "Info" },
    { key: "orders", label: "Orders" },
    { key: "timeline", label: "History" },
    { key: "automations", label: "Auto" },
  ];

  return (
    <aside className="flex h-full flex-col border-l bg-white">
      {/* Mobile back */}
      <div className="flex items-center border-b px-4 py-2 lg:hidden">
        <button onClick={onBack} className="text-sm text-gray-500">
          ← Back
        </button>
      </div>

      {/* Contact header */}
      <div className="flex flex-col items-center border-b px-4 py-5">
        <ContactAvatar
          name={contact.name ?? contact.wa_id}
          imageUrl={contact.avatar_url}
          size="lg"
        />
        <h3 className="mt-2 font-semibold text-gray-900">
          {contact.name ?? contact.profile_name ?? contact.wa_id}
        </h3>
        <p className="text-sm text-gray-500">{contact.phone}</p>
        <div className="mt-2 flex gap-1.5">
          <StatusBadge status={contact.lifecycle_stage} />
          <StatusBadge status={contact.status} />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2 text-xs font-medium ${
              activeTab === tab.key ? "border-b-2 border-green-500 text-green-600" : "text-gray-500"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === "info" && (
          <div className="space-y-3 text-sm">
            {contact.email && (
              <div className="flex justify-between">
                <span className="text-gray-500">Email</span>
                <span className="text-gray-900">{contact.email}</span>
              </div>
            )}
            {contact.city && (
              <div className="flex justify-between">
                <span className="text-gray-500">City</span>
                <span className="text-gray-900">{contact.city}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">Messages</span>
              <span className="font-medium text-gray-900">
                {contact.total_messages_received + contact.total_messages_sent}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Orders</span>
              <span className="font-medium text-gray-900">{contact.total_orders}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Total Spend</span>
              <span className="font-medium text-gray-900">
                ₹{Number(contact.total_order_value).toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Customer Since</span>
              <span className="text-gray-900">
                {contact.first_message_at
                  ? new Date(contact.first_message_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "—"}
              </span>
            </div>

            {/* Tags */}
            {contact.tags.length > 0 && (
              <div>
                <p className="mb-1.5 text-xs font-medium text-gray-500">Tags</p>
                <div className="flex flex-wrap gap-1">
                  {contact.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            <div>
              <p className="mb-1.5 text-xs font-medium text-gray-500">Notes</p>
              <textarea
                defaultValue={contact.notes ?? ""}
                placeholder="Add notes about this contact…"
                rows={3}
                className="w-full rounded-lg border px-3 py-2 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
              />
            </div>

            <a
              href={`/contacts/${contact.id}`}
              className="block text-center text-xs font-medium text-green-600 hover:underline"
            >
              View full profile →
            </a>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="text-center text-sm text-gray-400">
            <p>Order history will appear here</p>
            <button className="mt-3 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
              Create Order
            </button>
          </div>
        )}

        {activeTab === "timeline" && (
          <div className="text-center text-sm text-gray-400">
            Conversation history will appear here
          </div>
        )}

        {activeTab === "automations" && (
          <div className="text-center text-sm text-gray-400">Automation logs will appear here</div>
        )}
      </div>
    </aside>
  );
}
