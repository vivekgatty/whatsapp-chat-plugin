"use client";

import { ContactAvatar } from "@/components/shared/ContactAvatar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { Contact } from "@/types";

interface Props {
  contactId?: string | null;
  conversationId?: string | null;
}

export function ContactPanel({ contactId: _contactId }: Props) {
  // TODO: Fetch contact details from conversation or contactId
  const contact: Contact | null = null;

  if (!contact) {
    return (
      <aside className="hidden w-72 border-l bg-white lg:block">
        <div className="p-4 text-center text-sm text-gray-500">No contact selected</div>
      </aside>
    );
  }

  return (
    <aside className="hidden w-72 border-l bg-white lg:block">
      <div className="space-y-4 p-4">
        <div className="flex flex-col items-center text-center">
          <ContactAvatar name={contact.name ?? contact.wa_id} size="lg" />
          <h3 className="mt-2 font-semibold text-gray-900">
            {contact.name ?? contact.profile_name ?? contact.wa_id}
          </h3>
          <p className="text-sm text-gray-500">{contact.phone}</p>
          <StatusBadge status={contact.lifecycle_stage} />
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Status</span>
            <span className="font-medium">{contact.status}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Messages</span>
            <span className="font-medium">
              {contact.total_messages_received + contact.total_messages_sent}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Orders</span>
            <span className="font-medium">{contact.total_orders}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Total Value</span>
            <span className="font-medium">
              ₹{Number(contact.total_order_value).toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        {contact.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {contact.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
