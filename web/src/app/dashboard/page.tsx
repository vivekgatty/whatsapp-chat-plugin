import { redirect } from "next/navigation";

// Server component: immediately send users to the canonical Overview tab.
export const dynamic = "force-static";

export default function DashboardIndex() {
  redirect("/dashboard/overview");
  // Fallback return for type-safety; not reached.
  return null;
}
