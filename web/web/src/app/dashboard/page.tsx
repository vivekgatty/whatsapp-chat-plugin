// web/src/app/dashboard/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";

export default async function DashboardPage() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: "", ...options, maxAge: 0 });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?redirectedFrom=/dashboard");
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-2">Dashboard</h1>
      <p className="opacity-80 mb-6">
        Welcome{user?.email ? `, ${user.email}` : ""}.
      </p>
      <a href="/auth/signout" className="underline text-emerald-500">Sign out</a>
    </main>
  );
}
