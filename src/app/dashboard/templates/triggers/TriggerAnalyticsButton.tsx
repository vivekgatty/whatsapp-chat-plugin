"use client";
import Link from "next/link";

export default function TriggerAnalyticsButton() {
  return (
    <Link
      href="/dashboard/analytics/triggers"
      aria-label="View trigger analytics"
      style={{
        position: "fixed",
        right: 16,
        top: 76,               // below the top nav; adjust if needed
        zIndex: 1000,
        padding: "8px 12px",
        borderRadius: 9999,
        background: "#f59e0b", // amber pill for dark UI
        color: "#111",
        fontWeight: 600,
        textDecoration: "none",
        boxShadow: "0 6px 18px rgba(0,0,0,.25)",
      }}
    >
      Trigger analytics
    </Link>
  );
}