export const dynamic = "force-dynamic";

import { getSupabaseServer } from "../../lib/supabaseServer";

type Biz = {
  name?: string;
  website?: string;
  email?: string;
  country?: string;
  dial_code?: string;
  phone?: string;
  logo_url?: string;
};

async function getBusiness(): Promise<Biz | null> {
  const supa = await getSupabaseServer();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) return null;
  const { data, error } = await supa
    .from("businesses")
    .select("company_name,name,website,email,country,dial_code,phone,logo_url")
    .eq("owner_id", user.id)
    .maybeSingle();
  if (error) return null;
  const b: any = data ?? {};
  return {
    name: b.company_name ?? b.name ?? "",
    website: b.website ?? "",
    email: b.email ?? "",
    country: b.country ?? "",
    dial_code: b.dial_code ?? "",
    phone: b.phone ?? "",
    logo_url: b.logo_url ?? undefined,
  };
}

export default async function DashboardPage() {
  const biz = await getBusiness();
  const displayPhone = biz?.dial_code && biz?.phone ? `${biz.dial_code} ${biz.phone}` : (biz?.phone ?? "");
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-3xl font-semibold">Dashboard <span className="ml-2 text-xs align-super bg-slate-800 px-2 py-1 rounded">FREE</span></h1>

      <div className="rounded border border-slate-700 p-4">
        <div className="flex items-center gap-4">
          {biz?.logo_url ? (
            <img src={biz.logo_url} alt="Logo" className="h-14 w-14 rounded bg-slate-800 object-cover" />
          ) : (
            <div className="h-14 w-14 rounded bg-slate-800 grid place-items-center text-xs text-slate-400">No logo</div>
          )}
          <div>
            <div className="text-lg font-medium">{biz?.name || "-"}</div>
            <div className="text-slate-400 text-sm">{biz?.country || ""}</div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          <div><span className="text-slate-400">Website:</span> {biz?.website ? <a className="text-sky-400 hover:underline" href={biz.website} target="_blank">{biz.website}</a> : "-"}</div>
          <div><span className="text-slate-400">Email:</span> {biz?.email || "-"}</div>
          <div><span className="text-slate-400">Phone:</span> {displayPhone || "-"}</div>
        </div>

        <div className="mt-4">
          <a href="/dashboard/profile" className="inline-block bg-slate-800 hover:bg-slate-700 rounded px-3 py-2 text-sm">Edit profile</a>
        </div>
      </div>

      <div className="rounded border border-slate-700 p-4">
        <div className="font-medium mb-1">Usage</div>
        <div className="text-sm text-slate-300">Messages this month: 0 / 100</div>
      </div>

      <div className="rounded border border-slate-700 p-4">
        <div className="font-medium mb-1">Billing</div>
        <div className="text-sm">View receipts on the <a className="text-sky-400 hover:underline" href="/billing">Billing page</a>.</div>
      </div>
    </div>
  );
}