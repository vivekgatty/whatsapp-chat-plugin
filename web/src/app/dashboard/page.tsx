import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardPage() {
  const store = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return store.get(name)?.value; },
        set(name: string, value: string, options: CookieOptions) { store.set({ name, value, ...options }); },
        remove(name: string, options: CookieOptions) { store.set({ name, value: "", ...options, maxAge: 0 }); },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirectedFrom=/dashboard");

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="mt-2 text-sm text-zinc-400">You are signed in as {user?.email}</p>
    </main>
  );
}
