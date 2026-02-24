"use client";

export default function NotificationsSettingsPage() {
  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Notification Preferences</h1>
      <div className="space-y-4 rounded-xl border bg-white p-6">
        {[
          { key: "new_message", label: "New message from contact" },
          { key: "assigned", label: "Conversation assigned to you" },
          { key: "mentioned", label: "Mentioned in internal note" },
          { key: "daily_summary", label: "Daily activity summary" },
        ].map((pref) => (
          <label key={pref.key} className="flex items-center justify-between">
            <span className="text-sm text-gray-700">{pref.label}</span>
            <input type="checkbox" defaultChecked className="h-4 w-4" />
          </label>
        ))}
      </div>
      <div className="mt-6">
        <button className="rounded-lg bg-green-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-green-700">
          Save Preferences
        </button>
      </div>
    </div>
  );
}
