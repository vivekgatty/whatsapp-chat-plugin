"use client";

import * as React from "react";

export function CopyBox({ snippet }: { snippet: string }) {
  const [copied, setCopied] = React.useState(false);
  return (
    <div className="mt-3">
      <button
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(snippet);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } catch {}
        }}
        style={{
          background: "#10b981",
          color: "white",
          padding: "8px 12px",
          borderRadius: 8,
        }}
      >
        {copied ? "Copied!" : "Copy snippet"}
      </button>
    </div>
  );
}
