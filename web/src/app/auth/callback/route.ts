import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") || "/dashboard";
  if (!code) return NextResponse.redirect(new URL(`/login?error=missing_code&redirectedFrom=${encodeURIComponent(next)}`, url.origin));
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { cookies });
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  const dest = error
    ? new URL(`/login?error=${encodeURIComponent(error.message)}&redirectedFrom=${encodeURIComponent(next)}`, url.origin)
    : new URL(next, url.origin);
  return NextResponse.redirect(dest);
}
