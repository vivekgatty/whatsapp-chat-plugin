"use client";

import type { Template } from "@/types";

interface Props {
  onSelect: (templateName: string) => void;
  onClose: () => void;
}

export function TemplatePicker({ onSelect, onClose }: Props) {
  // TODO: Fetch approved templates from Supabase
  const templates: Template[] = [];

  return (
    <div className="absolute right-4 bottom-full left-4 mb-2 max-h-72 overflow-y-auto rounded-lg border bg-white shadow-lg">
      <div className="flex items-center justify-between border-b px-3 py-2">
        <span className="text-xs font-medium text-gray-500">Message Templates</span>
        <button onClick={onClose} className="text-xs text-gray-400 hover:text-gray-600">
          ✕
        </button>
      </div>
      {templates.length === 0 ? (
        <p className="px-3 py-4 text-center text-sm text-gray-500">No approved templates yet</p>
      ) : (
        templates.map((t) => (
          <button
            key={t.id}
            onClick={() => onSelect(t.display_name)}
            className="flex w-full flex-col gap-1 border-b px-3 py-2 text-left last:border-0 hover:bg-gray-50"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900">{t.display_name}</span>
              <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500">
                {t.category}
              </span>
            </div>
            <p className="line-clamp-2 text-xs text-gray-500">{t.body_text}</p>
          </button>
        ))
      )}
    </div>
  );
}
