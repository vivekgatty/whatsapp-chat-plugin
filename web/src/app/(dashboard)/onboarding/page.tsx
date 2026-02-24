import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function OnboardingPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("onboarding_step")
    .eq("owner_id", user.id)
    .single();

  const step = workspace?.onboarding_step ?? "meta_connect";

  const stepRoutes: Record<string, string> = {
    meta_connect: "/onboarding/connect-whatsapp",
    business_profile: "/onboarding/business-profile",
    team_setup: "/onboarding/team-setup",
    first_template: "/onboarding/first-template",
    test_connection: "/onboarding/test-connection",
  };

  redirect(stepRoutes[step] ?? "/onboarding/connect-whatsapp");
}
