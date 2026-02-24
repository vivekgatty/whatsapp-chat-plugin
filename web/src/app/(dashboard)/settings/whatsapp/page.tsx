"use client";

import { StatusBadge } from "@/components/shared/StatusBadge";
import type { WhatsAppConnection } from "@/types";

export default function WhatsAppSettingsPage() {
  // TODO: Fetch whatsapp_connections for current workspace
  const connection: WhatsAppConnection | null = null;

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">WhatsApp Connection</h1>

      {connection ? (
        <div className="space-y-4 rounded-xl border bg-white p-6">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-900">
              {connection.display_phone_number ?? connection.phone_number}
            </span>
            <StatusBadge status={connection.status} />
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Quality Rating</span>
              <StatusBadge status={connection.quality_rating} />
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Messaging Limit</span>
              <span className="font-medium">{connection.messaging_limit}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Webhook Verified</span>
              <span className="font-medium">{connection.webhook_verified ? "Yes" : "No"}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
          <p className="mb-4 text-gray-500">No WhatsApp Business account connected</p>
          <a
            href="/onboarding/connect-whatsapp"
            className="rounded-lg bg-green-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-green-700"
          >
            Connect WhatsApp
          </a>
        </div>
      )}
    </div>
  );
}
