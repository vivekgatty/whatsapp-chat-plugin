"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

const DAY_LABELS: Record<DayKey, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

function fmt(s24: string | undefined, closed?: boolean) {
  if (closed) return "Holiday";
  if (!s24) return "—";
  const [hstr, m] = s24.split(":");
  let h = Number(hstr);
  const mer = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  return `${String(h).padStart(2, "0")}:${m} ${mer}`;
}

export default function BusinessProfileView() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr(null);

      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user;
      if (!user) {
        router.push("/login?redirectedFrom=%2Fbusinessprofile");
        return;
      }
      setEmail(user.email ?? "");

      const { data: row, error } = await supabase
        .from("businesses")
        .select("*")
        .eq("owner_id", user.id) // use owner_id consistently
        .maybeSingle();

      if (error) {
        setErr(error.message);
      } else {
        setData(row);
      }
      setLoading(false);
    })();
  }, [router, supabase]);

  async function onSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (loading) {
    return <div className="p-6 text-sm text-gray-300">Loading…</div>;
  }

  const wh = data?.working_hours;

  return (
    <div className="max-w-4xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Business profile</h1>
        <div className="space-x-2">
          <button className="rounded border px-3 py-1" onClick={() => router.push("/dashboard")}>
            ← Back to dashboard
          </button>
          <button className="rounded border px-3 py-1" onClick={onSignOut}>
            Sign out
          </button>
        </div>
      </div>

      {err && <div className="mb-4 text-sm text-red-400">Error: {err}</div>}

      {!data ? (
        <div className="rounded border px-4 py-3">
          <p className="mb-2 text-sm text-green-400">Signed in as {email}.</p>
          <p className="mb-3">No business profile found yet.</p>
          <button
            className="rounded bg-emerald-600 px-3 py-2 text-sm"
            onClick={() => router.push("/editbusinessprofile")}
          >
            Create your business profile →
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="rounded border px-4 py-3">
            <p className="mb-2 text-sm text-green-400">Signed in as {email}.</p>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <div className="text-xs text-gray-400">Company</div>
                <div>{data.company_name || "—"}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Category</div>
                <div>{data.category || "—"}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400">WhatsApp (E.164)</div>
                <div>{data.whatsapp_e164 || "—"}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Contact</div>
                <div>{data.contact_name || "—"}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Timezone</div>
                <div>{data.timezone || "—"}</div>
              </div>
            </div>
          </div>

          <div className="rounded border px-4 py-3">
            <div className="mb-3 text-sm font-medium">Working hours</div>
            {!wh ? (
              <div className="text-sm text-gray-400">—</div>
            ) : (
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {(["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as DayKey[]).map((d) => {
                  const v = wh[d];
                  const line = v
                    ? v.closed
                      ? "Holiday"
                      : `${fmt(v.from, false)} — ${fmt(v.to, false)}`
                    : "—";
                  return (
                    <div key={d} className="flex justify-between rounded border px-3 py-2">
                      <div className="text-sm">{DAY_LABELS[d]}</div>
                      <div className="text-sm text-gray-200">{line}</div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-4">
              <button
                className="rounded border px-3 py-2 text-sm"
                onClick={() => router.push("/editbusinessprofile")}
              >
                Edit business profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
