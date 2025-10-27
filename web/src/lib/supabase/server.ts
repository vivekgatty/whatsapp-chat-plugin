import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

/**
 * Server-side Supabase client.
 * - Reads cookies from Next 15's async cookies()
 * - Only writes cookies when a NextResponse is provided (RSC-safe: no-ops otherwise)
 */
export async function createClient(res?: NextResponse) {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // In React Server Components there is no response to mutate: make write a no-op
          if (res) res.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          if (res) res.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );
}
