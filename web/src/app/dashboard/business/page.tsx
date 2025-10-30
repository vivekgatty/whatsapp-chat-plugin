import { redirect } from "next/navigation";
import { getSupabaseServer } from "../../../lib/supabaseServer";
import BusinessForm from "./ui/BusinessForm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function BusinessPage() {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirectedFrom=/dashboard/business");

  const { data: business } = await supabase
    .from("businesses")
    .select("*")
    .eq("owner_user_id", user.id)
    .maybeSingle();

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Edit business profile</h1>
      <p className="mb-4 text-sm text-emerald-400">Signed in as {user.email}.</p>
      <BusinessForm userId={user.id} initial={business ?? null} />
    </main>
  );
}
