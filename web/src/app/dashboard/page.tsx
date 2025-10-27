import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export const runtime = "nodejs";

// Server Component
export default async function DashboardPage() {
  const cookieStore = await cookies();

  // Create a Supabase server client using only read access to cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        // no-ops in a server component (we're not mutating cookies here)
        set(_n: string, _v: string, _o?: CookieOptions) {},
        remove(_n: string, _o?: CookieOptions) {},
      },
    }
  );

  // If not logged in, bounce to login with return path
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirectedFrom=/dashboard");

  // --- Your real dashboard UI can follow here ---
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="mt-2 text-sm text-zinc-400">You are signed in as {user.email}</p>
    </main>
  );
}