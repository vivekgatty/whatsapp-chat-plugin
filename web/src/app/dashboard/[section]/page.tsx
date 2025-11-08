import { redirect } from "next/navigation";
import type { PageProps } from "next";

export default async function SectionPage({ params }: PageProps<{ section: string }>) {
  const { section } = await params;

  const map: Record<string, string> = {
    widgetsettings: "/dashboard/templates#widget",
    docs: "/dashboard/templates#docs",
    billing: "/dashboard/analytics#billing",
    editprofile: "/dashboard/overview#profile",
  };

  redirect(map[section] ?? "/dashboard/overview");
}
