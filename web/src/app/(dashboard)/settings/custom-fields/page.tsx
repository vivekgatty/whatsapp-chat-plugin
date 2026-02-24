"use client";

export default function CustomFieldsSettingsPage() {
  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Custom Fields</h1>
        <button className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
          Add Field
        </button>
      </div>
      <p className="text-sm text-gray-500">
        Define custom contact fields specific to your business. These appear in the contact detail
        panel and can be used in automation conditions and template variables.
      </p>
      <div className="mt-6 rounded-xl border-2 border-dashed border-gray-200 p-8 text-center text-sm text-gray-400">
        No custom fields defined yet.
      </div>
    </div>
  );
}
