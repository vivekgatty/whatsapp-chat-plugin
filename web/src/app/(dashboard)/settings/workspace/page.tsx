"use client";

export default function WorkspaceSettingsPage() {
  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Workspace Settings</h1>
      <div className="space-y-6 rounded-xl border bg-white p-6">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Business Name</label>
          <input
            type="text"
            className="w-full rounded-lg border px-4 py-2.5 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Industry</label>
          <select className="w-full rounded-lg border px-4 py-2.5 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none">
            <option>Food &amp; Restaurant</option>
            <option>Healthcare</option>
            <option>Education</option>
            <option>Retail</option>
            <option>Other</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Timezone</label>
          <select className="w-full rounded-lg border px-4 py-2.5 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none">
            <option>Asia/Kolkata</option>
          </select>
        </div>
        <button className="rounded-lg bg-green-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-green-700">
          Save Changes
        </button>
      </div>
    </div>
  );
}
