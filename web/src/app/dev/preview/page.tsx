// src/app/dev/preview/page.tsx
import Script from "next/script";

export const dynamic = "force-dynamic";

const WIDGET_ID = "3e7ec6a9-bd9e-40a9-86fd-d1d09c84bbbf"; // your current widget id

export default function Page() {
  return (
    <main className="p-8 space-y-4">
      <h1 className="text-2xl font-semibold">Dev: Widget Preview</h1>
      <p className="text-sm text-gray-500">
        This page loads <code>/api/widget.js?id={WIDGET_ID}</code> and should inject a floating
        WhatsApp bubble at the bottom {`(right by default)`}. Click it to open a WhatsApp chat with
        the prefilled message.
      </p>

      {/* Load the public embed script after page is interactive */}
      <Script src={`/api/widget.js?id=${WIDGET_ID}`} strategy="afterInteractive" />
    </main>
  );
}
