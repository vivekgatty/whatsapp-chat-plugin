import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const url = new URL(req.url);
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

  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/login", url.origin));
}
