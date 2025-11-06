"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TriggerAnalyticsCTA() {
  const pathname = usePathname();
  // Show only on /dashboard/analytics (not on /analytics/triggers)
  if (pathname !== "/dashboard/analytics") return null;

  return (
    <Link
      href="/dashboard/analytics/triggers"
      aria-label="View Trigger Events analytics"
      style={{
        position: "fixed",
        right: 16,
        bottom: 16,
        zIndex: 5000,
        padding: "10px 14px",
        borderRadius: 9999,
        background: "#f59e0b",
        color: "#111",
        fontWeight: 700,
        textDecoration: "none",
        boxShadow: "0 8px 22px rgba(0,0,0,.35)",
        letterSpacing: ".2px"
      }}
    >
      Trigger events →
    </Link>
  );
}
