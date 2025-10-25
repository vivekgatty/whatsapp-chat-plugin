import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Read-only Supabase client for React Server Components.
 * Next.js 15 forbids mutating cookies during render, so set/remove are no-ops.
 * Route handlers (e.g. /auth/callback) should create their own client that
 * attaches cookies on the Response (see auth callback).
 */
export function createClient() {
  const cookieStore = cookies(); // RSC-safe

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        // No-ops to avoid "Cookies can only be modified..." in RSC.
        set(_name: string, _value: string, _options: CookieOptions) {},
        remove(_name: string, _options: CookieOptions) {},
      },
    }
  );
}
