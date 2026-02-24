"use client";

import Link from "next/link";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { Broadcast } from "@/types";

export default function BroadcastsPage() {
  // TODO: Fetch broadcasts list
  const broadcasts: Broadcast[] = [];

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Broadcasts</h1>
          <p className="text-sm text-gray-500">Send template messages to multiple contacts</p>
        </div>
        <Link
          href="/broadcasts/new"
          className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
        >
          New Broadcast
        </Link>
      </div>

      {broadcasts.length === 0 ? (
        <EmptyState
          title="No broadcasts yet"
          description="Create your first broadcast to reach multiple contacts at once."
        />
      ) : (
        <div className="space-y-3">
          {broadcasts.map((b) => (
            <a
              key={b.id}
              href={`/broadcasts/${b.id}`}
              className="block rounded-xl border bg-white p-4 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">{b.name}</span>
                <StatusBadge status={b.status} />
              </div>
              <div className="mt-2 flex gap-4 text-xs text-gray-500">
                <span>Sent: {b.total_sent}</span>
                <span>Delivered: {b.total_delivered}</span>
                <span>Read: {b.total_read}</span>
                <span>Replied: {b.total_replied}</span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
