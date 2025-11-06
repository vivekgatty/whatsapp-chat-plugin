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
  const {
    data: { user },
  } = await supa.auth.getUser();
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
  const displayPhone =
    biz?.dial_code && biz?.phone ? `${biz.dial_code} ${biz.phone}` : (biz?.phone ?? "");
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6">
      <h1 className="text-3xl font-semibold">
        Dashboard{" "}
        <span className="ml-2 rounded bg-slate-800 px-2 py-1 align-super text-xs">FREE</span>
      </h1>
<div data-id="quick-links-lang-hours" className="mt-6 flex flex-wrap gap-2">
  <a
    href="/dashboard/language"
    className="rounded bg-slate-800 px-3 py-2 text-sm hover:bg-slate-700"
  >
    Languages
  </a>
  <a
    href="/dashboard/hours"
    className="rounded bg-slate-800 px-3 py-2 text-sm hover:bg-slate-700"
  >
    Business Hours
  </a>
</div>
      <nav className="mt-2 mb-4 flex flex-wrap gap-2 text-sm">
        <a href="/dashboard" className="rounded bg-slate-800 px-3 py-1.5 hover:bg-slate-700">
          Overview
        </a>
        <a href="/dashboard/widget" className="rounded bg-slate-800 px-3 py-1.5 hover:bg-slate-700">
          Widget
        </a>
        <a href="/billing" className="rounded bg-slate-800 px-3 py-1.5 hover:bg-slate-700">
          Billing
        </a>
        <a
          href="/dashboard/analytics"
          className="rounded bg-amber-600 px-3 py-1.5 text-black hover:bg-amber-500"
        >
          Analytics
        </a>
      </nav>
      <div className="mb-3 flex justify-end">
        <div className="flex flex-wrap gap-2">
          <a
            href="/dashboard/profile"
            className="rounded bg-slate-800 px-3 py-2 text-sm hover:bg-slate-700"
          >
            Edit profile
          </a>
          <a
            href="/dashboard/widget"
            className="rounded bg-slate-800 px-3 py-2 text-sm hover:bg-slate-700"
          >
            Widget settings
          </a>
          <a href="/billing" className="rounded bg-slate-800 px-3 py-2 text-sm hover:bg-slate-700">
            Manage plan
          </a>
          <form action="/api/auth/signout" method="post">
            <button
              type="submit"
              className="rounded bg-slate-800 px-3 py-2 text-sm hover:bg-slate-700"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>

      <div className="rounded border border-slate-700 p-4">
        <div className="flex items-center gap-4">
          {biz?.logo_url ? (
            <img
              src={biz.logo_url}
              alt="Logo"
              className="h-14 w-14 rounded bg-slate-800 object-cover"
            />
          ) : (
            <div className="grid h-14 w-14 place-items-center rounded bg-slate-800 text-xs text-slate-400">
              No logo
            </div>
          )}
          <div>
            <div className="text-lg font-medium">{biz?.name || "-"}</div>
            <div className="text-sm text-slate-400">{biz?.country || ""}</div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
          <div>
            <span className="text-slate-400">Website:</span>{" "}
            {biz?.website ? (
              <a className="text-sky-400 hover:underline" href={biz.website} target="_blank">
                {biz.website}
              </a>
            ) : (
              "-"
            )}
          </div>
          <div>
            <span className="text-slate-400">Email:</span> {biz?.email || "-"}
          </div>
          <div>
            <span className="text-slate-400">Phone:</span> {displayPhone || "-"}
          </div>
        </div>

        <div className="mt-4">
          <a
            href="/dashboard/profile"
            className="inline-block rounded bg-slate-800 px-3 py-2 text-sm hover:bg-slate-700"
          >
            Edit profile
          </a>
        </div>
      </div>

      <div className="rounded border border-slate-700 p-4">
        <div className="mb-1 font-medium">Usage</div>
        <div className="text-sm text-slate-300">Messages this month: 0 / 100</div>
      </div>

      <div className="rounded border border-slate-700 p-4">
        <div className="mb-1 font-medium">Billing</div>
        <div className="text-sm">
          View receipts on the{" "}
          <a className="text-sky-400 hover:underline" href="/billing">
            Billing page
          </a>
          .
        </div>
      </div>
    </div>
  );
}

