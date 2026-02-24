"use client";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

const FILTERS = [
  { value: "all", label: "All" },
  { value: "open", label: "Open" },
  { value: "pending", label: "Pending" },
  { value: "resolved", label: "Resolved" },
  { value: "snoozed", label: "Snoozed" },
];

export function InboxFilters({ value, onChange }: Props) {
  return (
    <div className="mt-2 flex gap-1 overflow-x-auto">
      {FILTERS.map((f) => (
        <button
          key={f.value}
          onClick={() => onChange(f.value)}
          className={`rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap transition-colors ${
            value === f.value ? "bg-green-100 text-green-700" : "text-gray-500 hover:bg-gray-100"
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
