"use client";

export default function IntegrationsSettingsPage() {
  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Integrations</h1>
      <div className="space-y-4">
        <div className="rounded-xl border bg-white p-6">
          <h3 className="font-semibold text-gray-900">Incoming Webhooks</h3>
          <p className="mt-1 text-sm text-gray-500">
            Receive external events to trigger automations.
          </p>
          <div className="mt-3 rounded-lg bg-gray-50 p-3">
            <code className="text-xs text-gray-600">
              POST /api/automations/execute?workspace=YOUR_WORKSPACE_ID
            </code>
          </div>
        </div>
        <div className="rounded-xl border bg-white p-6">
          <h3 className="font-semibold text-gray-900">Outgoing Webhooks</h3>
          <p className="mt-1 text-sm text-gray-500">
            Send events to external services when actions occur.
          </p>
          <button className="mt-3 rounded-lg border px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
            Add Webhook URL
          </button>
        </div>
      </div>
    </div>
  );
}
