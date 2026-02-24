"use client";

import { useState } from "react";
import Link from "next/link";

type Step = "upload" | "mapping" | "preview" | "importing" | "done";

export default function ImportContactsPage() {
  const [step, setStep] = useState<Step>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [_columns, setColumns] = useState<string[]>([]);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const firstLine = text.split("\n")[0];
      setColumns(firstLine.split(",").map((c) => c.trim()));
      setStep("mapping");
    };
    reader.readAsText(selected);
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-2 text-2xl font-bold text-gray-900">Import Contacts</h1>
      <p className="mb-8 text-gray-600">Upload a CSV file to bulk import contacts into your CRM.</p>

      {step === "upload" && (
        <div className="rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
          <p className="mb-4 text-sm text-gray-500">Drop a CSV file here or click to browse</p>
          <label className="cursor-pointer rounded-lg bg-green-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-green-700">
            Choose File
            <input type="file" accept=".csv" onChange={handleFileSelect} className="hidden" />
          </label>
        </div>
      )}

      {step === "mapping" && file && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            File: <strong>{file.name}</strong>
          </p>
          <p className="text-sm text-gray-500">
            Map your CSV columns to contact fields. (Field mapping UI coming soon.)
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setStep("upload")}
              className="rounded-lg border px-4 py-2 text-sm text-gray-600"
            >
              Back
            </button>
            <button
              onClick={() => setStep("preview")}
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {step === "preview" && (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Preview and confirm your import. (Preview table coming soon.)
          </p>
          <button
            onClick={() => setStep("importing")}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            Start Import
          </button>
        </div>
      )}

      {step === "importing" && (
        <div className="text-center">
          <p className="text-sm text-gray-600">Importing contacts…</p>
        </div>
      )}

      {step === "done" && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
          <p className="text-lg font-semibold text-green-800">Import complete!</p>
          <Link href="/contacts" className="mt-3 inline-block text-sm text-green-600 underline">
            View contacts
          </Link>
        </div>
      )}
    </div>
  );
}
