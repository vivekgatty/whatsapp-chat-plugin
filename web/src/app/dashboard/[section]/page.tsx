import { redirect } from "next/navigation";

export default async function SectionPage(
  props: { params: Promise<{ section: string }> }
) {
  const { section } = await props.params;

  const map: Record<string, string> = {
    widgetsettings: "/dashboard/templates#widget",
    docs: "/dashboard/templates#docs",
    billing: "/dashboard/analytics#billing",
    editprofile: "/dashboard/overview#profile",
  };

  redirect(map[section] ?? "/dashboard/overview");
}
