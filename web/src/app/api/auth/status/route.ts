import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function GET() {
  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set() { /* no-op in API read */ },
        remove() { /* no-op in API read */ },
      },
    }
  );

  const { data, error } = await supabase.auth.getUser();
  const authed = !!data?.user && !error;

  return NextResponse.json({ ok: true, authed });
}
