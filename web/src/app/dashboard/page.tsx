import Link from "next/link";
import { redirect } from "next/navigation";
import { getSupabaseServer } from "../../lib/supabaseServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardPage() {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirectedFrom=/dashboard");

  // Try to fetch some useful bits; fail soft if tables/cols differ.
  let business: any = null, widget: any = null, sub: any = null;
  try { business = (await supabase.from("businesses").select("*").eq("owner_user_id", user.id).maybeSingle()).data; } catch {}
  try { widget   = (await supabase.from("widgets").select("*").eq("owner_user_id", user.id).maybeSingle()).data; } catch {}
  try { sub      = (await supabase.from("profiles").select("subscription_status,plan").eq("id", user.id).maybeSingle()).data; } catch {}

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-6">
      <header>
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <p className="text-sm text-zinc-400 mt-1">Signed in as {user.email}</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-zinc-700 p-4">
          <h2 className="font-medium">Business profile</h2>
          <p className="text-sm text-zinc-400 mt-1">
            {business ? (business.name ?? business.id) : "No business on file yet."}
          </p>
          <div className="mt-3 flex gap-2">
            <Link href="/dashboard/business" className="px-3 py-2 rounded-md bg-emerald-600 text-white">Edit profile</Link>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-700 p-4">
          <h2 className="font-medium">Widget</h2>
          <p className="text-sm text-zinc-400 mt-1">
            {widget ? `Widget ID: ${widget.id}` : "Create and configure your chat widget."}
          </p>
          <div className="mt-3 flex gap-2">
            <Link href="/dashboard/widget" className="px-3 py-2 rounded-md bg-emerald-600 text-white">Widget settings</Link>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-700 p-4">
          <h2 className="font-medium">Subscription</h2>
          <p className="text-sm text-zinc-400 mt-1">{sub?.subscription_status ?? "Not subscribed"}</p>
          <div className="mt-3 flex gap-2">
            <Link href="/pricing" className="px-3 py-2 rounded-md bg-emerald-600 text-white">Manage plan</Link>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-700 p-4">
          <h2 className="font-medium">Account</h2>
          <form action="/auth/signout" method="post" className="mt-3">
            <button className="px-3 py-2 rounded-md bg-zinc-800 border border-zinc-600">Sign out</button>
          </form>
        </div>
      </section>
    </main>
  );
}
