"use client";

import Link from "next/link";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { Template } from "@/types";

export default function TemplatesPage() {
  // TODO: Fetch templates
  const templates: Template[] = [];

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Message Templates</h1>
          <p className="text-sm text-gray-500">Meta-approved templates for outbound messaging</p>
        </div>
        <Link
          href="/templates/new"
          className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
        >
          New Template
        </Link>
      </div>

      {templates.length === 0 ? (
        <EmptyState
          title="No templates yet"
          description="Create message templates and submit them to Meta for approval."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((t) => (
            <a
              key={t.id}
              href={`/templates/${t.id}`}
              className="rounded-xl border bg-white p-4 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">{t.display_name}</span>
                <StatusBadge status={t.meta_template_status} />
              </div>
              <p className="mt-2 line-clamp-3 text-sm text-gray-500">{t.body_text}</p>
              <div className="mt-3 flex gap-2 text-xs text-gray-400">
                <span>{t.category}</span>
                <span>·</span>
                <span>Used {t.times_used}x</span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
