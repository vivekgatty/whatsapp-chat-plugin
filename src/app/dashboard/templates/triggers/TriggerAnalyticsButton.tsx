"use client";
import Link from "next/link";

export default function TriggerAnalyticsButton() {
  return (
    <Link
      href="/dashboard/analytics/triggers"
      aria-label="View Trigger events analytics"
      style={{
        position: "fixed",
        bottom: 16,     // bottom-right to avoid any header overlap
        right: 16,
        zIndex: 5000,   // very high to ensure it's visible above content
        padding: "10px 14px",
        borderRadius: 9999,
        background: "#f59e0b", // amber
        color: "#111",
        fontWeight: 700,
        textDecoration: "none",
        boxShadow: "0 8px 22px rgba(0,0,0,.35)",
        letterSpacing: ".2px",
      }}
    >
      Trigger analytics
    </Link>
  );
}
