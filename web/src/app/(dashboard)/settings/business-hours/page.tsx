"use client";

const DAYS = [
  { key: "mon", label: "Monday" },
  { key: "tue", label: "Tuesday" },
  { key: "wed", label: "Wednesday" },
  { key: "thu", label: "Thursday" },
  { key: "fri", label: "Friday" },
  { key: "sat", label: "Saturday" },
  { key: "sun", label: "Sunday" },
];

export default function BusinessHoursSettingsPage() {
  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Business Hours</h1>
      <div className="space-y-3">
        {DAYS.map((day) => (
          <div key={day.key} className="flex items-center gap-4 rounded-lg border bg-white p-4">
            <label className="flex w-28 items-center gap-2">
              <input type="checkbox" defaultChecked={day.key !== "sun"} />
              <span className="text-sm font-medium text-gray-900">{day.label}</span>
            </label>
            <input
              type="time"
              defaultValue="09:00"
              className="rounded border px-3 py-1.5 text-sm"
            />
            <span className="text-gray-400">to</span>
            <input
              type="time"
              defaultValue="18:00"
              className="rounded border px-3 py-1.5 text-sm"
            />
          </div>
        ))}
      </div>
      <div className="mt-6">
        <button className="rounded-lg bg-green-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-green-700">
          Save Hours
        </button>
      </div>
    </div>
  );
}
