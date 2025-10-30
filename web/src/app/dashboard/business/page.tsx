import { redirect } from "next/navigation";
import { getSupabaseServer } from "../../../lib/supabaseServer";

export const runtime="nodejs"; export const dynamic="force-dynamic"; export const revalidate=0;

export default async function BusinessPage(){
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirectedFrom=/dashboard/business");
  return <main className="p-6">Business profile editor — placeholder. Replace with your full UI.</main>;
}
