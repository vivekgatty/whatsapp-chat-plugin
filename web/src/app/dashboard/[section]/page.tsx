import { redirect } from "next/navigation";

type Params = { params: { section: string } };

/**
 * Temporary router alias:
 * - /dashboard/widgetsettings => /dashboard/templates#widget
 * - /dashboard/docs           => /dashboard/templates#docs
 * - /dashboard/billing        => /dashboard/analytics#billing
 * - /dashboard/editprofile    => /dashboard/overview#profile
 * - anything else             => /dashboard/overview
 *
 * This removes 404s while we restore proper standalone pages.
 */
export default function SectionPage({ params }: Params) {
  const map: Record<string, string> = {
    widgetsettings: "/dashboard/templates#widget",
    docs: "/dashboard/templates#docs",
    billing: "/dashboard/analytics#billing",
    editprofile: "/dashboard/overview#profile",
  };

  const target = map[params.section] ?? "/dashboard/overview";
  redirect(target);
}
