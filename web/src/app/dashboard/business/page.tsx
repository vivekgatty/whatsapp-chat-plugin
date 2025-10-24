// src/app/dashboard/business/page.tsx
import { redirect } from "next/navigation";

// Avoid caching the redirect in edge/CDN during dev
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function Page() {
  // Send users to the legacy Business Profile editor you prefer
  redirect("/businessprofile");
}
