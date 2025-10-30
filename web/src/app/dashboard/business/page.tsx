import { redirect } from "next/navigation";
import { getSupabaseServer } from "../../../lib/supabaseServer";
import BusinessForm from "../../../components/BusinessForm";
import { defaultHours, HoursState } from "../../../components/HoursEditor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// ----- Server Action -----
async function saveBusiness(formData: FormData) {
  "use server";
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirectedFrom=/dashboard/business");

  const name = String(formData.get("name") ?? "");
  const category = String(formData.get("category") ?? "");
  const contact_name = String(formData.get("contact_name") ?? "");
  const timezone = String(formData.get("timezone") ?? "Asia/Kolkata");
  const cc = String(formData.get("whatsapp_cc") ?? "+91").replace(/[^\d+]/g, "");
  const national = String(formData.get("whatsapp_number") ?? "").replace(/[^\d]/g, "");
  const e164 = (cc.startsWith("+") ? cc : ("+"+cc)) + (national ? national : "");
  let hours: HoursState = defaultHours;
  try {
    const raw = String(formData.get("hours_json") ?? "");
    if (raw) hours = JSON.parse(raw);
  } catch {}

  // upsert by owner_user_id
  await supabase.from("businesses").upsert({
    owner_user_id: user.id,
    name,
    category,
    contact_name,
    timezone,
    whatsapp_cc: cc.startsWith("+") ? cc : ("+"+cc),
    whatsapp_number: national,
    whatsapp_e164: e164,
    working_hours: hours,
    updated_at: new Date().toISOString(),
  }, { onConflict: "owner_user_id" });

  redirect("/dashboard");
}

export default async function BusinessPage(){
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirectedFrom=/dashboard/business");

  // Try to load existing
  const { data: business } = await supabase
    .from("businesses")
    .select("*")
    .eq("owner_user_id", user.id)
    .maybeSingle();

  const initial = {
    name: business?.name ?? "",
    category: business?.category ?? "",
    contact_name: business?.contact_name ?? "",
    timezone: business?.timezone ?? "Asia/Kolkata",
    whatsapp_cc: business?.whatsapp_cc ?? "+91",
    whatsapp_number: business?.whatsapp_number ?? "",
    hours: (business?.working_hours as HoursState | null) ?? null,
  };

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Edit business profile</h1>
        <div className="flex gap-2">
          <a className="rounded-md border border-zinc-600 px-3 py-2" href="/dashboard">← Back to dashboard</a>
          <form action="/auth/signout" method="post"><button className="rounded-md border border-zinc-600 px-3 py-2">Sign out</button></form>
        </div>
      </div>

      <p className="text-sm text-emerald-400">Signed in as {user.email}.</p>

      <BusinessForm action={saveBusiness} initial={initial}/>
    </main>
  );
}
