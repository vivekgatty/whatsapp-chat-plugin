import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const cookieStore = await cookies();const supabase = createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    cookies: {
      get(name: string) { return cookieStore.get(name)?.value; },
      set(_n: string, _v: string, _o?: CookieOptions) {},
      remove(_n: string, _o?: CookieOptions) {},
    },
  }
);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirectedFrom=/dashboard");

  return (
    <main className="min-h-dvh max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="mt-4 text-sm text-zinc-300">Signed in as <b>{user?.email}</b></p>
    </main>
  );
}
