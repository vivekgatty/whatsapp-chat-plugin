import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient as supaCreateClient } from "@supabase/supabase-js";

/**
 * RSC/server-safe anon client for requests that do NOT need service role.
 */
export async function createClient(_res?: NextResponse) {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    process.env.SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anon) {
    throw new Error(
      "Public Supabase envs missing: set NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) and NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  // Avoid modifying cookies in RSC
  const cookieStore = await cookies();
  const c = {
    get(name: string) { return cookieStore.get(name)?.value; },
    set(_n: string, _v: string, _o?: any) {},
    remove(_n: string, _o?: any) {},
  };

  return supaCreateClient(url, anon, {
    auth: { persistSession: false },
    cookies: c as any,
  });
}