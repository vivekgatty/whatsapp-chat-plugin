import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") || "/dashboard";
  if (!code) return NextResponse.redirect(new URL("/login?error=missing_code", url.origin));

  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => cookieStore.get(name)?.value,
        set: (name, value, options) => cookieStore.set({ name, value, ...options }),
        remove: (name, options) => cookieStore.set({ name, value: "", ...options, maxAge: 0 }),
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error("exchangeCodeForSession:", error);
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message)}&redirectedFrom=${encodeURIComponent(next)}`, url.origin));
  }
  return NextResponse.redirect(new URL(next, url.origin));
}
