import { redirect } from "next/navigation";
import { getSupabaseServer } from "../../../lib/supabaseServer";
import WidgetPanel from "./ui/WidgetPanel";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function WidgetPage(){
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirectedFrom=/dashboard/widget");

  const { data: widget } = await supabase
    .from("widgets")
    .select("*")
    .eq("owner_user_id", user.id)
    .maybeSingle();

  return (
    <main className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-semibold mb-6">Widget settings</h1>
      <WidgetPanel userId={user.id} initial={widget ?? null} />
    </main>
  );
}
