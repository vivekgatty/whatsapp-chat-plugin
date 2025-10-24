'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function DashboardPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setEmail(user?.email ?? null);
    })();
  }, [supabase]);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <div className="flex gap-2">
          <Link
            href="/dashboard/widget"
            className="rounded border border-zinc-700 px-3 py-2 text-sm hover:bg-zinc-800"
          >
            Widget settings →
          </Link>
          <button
            onClick={signOut}
            className="rounded bg-zinc-700 px-3 py-2 text-sm text-white hover:bg-zinc-600"
          >
            Sign out
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-zinc-800 p-4">
        {email ? (
          <div className="text-zinc-300">
            Signed in as <span className="text-emerald-400">{email}</span>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="text-zinc-300">You are not signed in.</div>
            <Link
              href="/login"
              className="rounded bg-emerald-600 px-3 py-2 text-sm text-white hover:bg-emerald-500"
            >
              Go to login
            </Link>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <Link
          href="/businessprofile"
          className="rounded border border-zinc-700 px-3 py-2 text-sm hover:bg-zinc-800"
        >
          Business profile
        </Link>
        <Link
          href="/editbusinessprofile"
          className="rounded border border-zinc-700 px-3 py-2 text-sm hover:bg-zinc-800"
        >
          Edit business profile
        </Link>
        {/* Add analytics link here later if needed */}
      </div>
    </div>
  );
}
