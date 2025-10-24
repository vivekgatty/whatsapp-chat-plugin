// src/app/dashboard/profile/page.tsx
export const dynamic = "force-dynamic";

import Link from "next/link";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

export default async function ProfilePage() {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="min-h-dvh p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-semibold">Business profile</h1>
          <div className="space-x-3">
            <Link
              href="/dashboard"
              className="rounded-md bg-zinc-800 hover:bg-zinc-700 px-3 py-2"
            >
              ← Back to dashboard
            </Link>
            <Link
              href="/auth/signout"
              className="rounded-md bg-zinc-800 hover:bg-zinc-700 px-3 py-2"
            >
              Sign out
            </Link>
          </div>
        </div>

        <div className="rounded-md border border-zinc-700 p-4">
          <p className="text-red-400 mb-2">You are not signed in.</p>
          <Link
            href="/login?redirectedFrom=%2Fdashboard%2Fprofile"
            className="inline-block rounded-md bg-emerald-600 hover:bg-emerald-500 px-3 py-2 text-white"
          >
            Go to login
          </Link>
        </div>
      </main>
    );
  }

  // … your real profile form goes here …
  return (
    <main className="min-h-dvh p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-semibold">Business profile</h1>
        <div className="space-x-3">
          <Link
            href="/dashboard"
            className="rounded-md bg-zinc-800 hover:bg-zinc-700 px-3 py-2"
          >
            ← Back to dashboard
          </Link>
          <Link
            href="/auth/signout"
            className="rounded-md bg-zinc-800 hover:bg-zinc-700 px-3 py-2"
          >
            Sign out
          </Link>
        </div>
      </div>

      <div className="rounded-md border border-zinc-700 p-4">
        <p className="text-zinc-300">
          You’re signed in as <b>{user.email}</b>. (Profile form to be added.)
        </p>
      </div>
    </main>
  );
}
