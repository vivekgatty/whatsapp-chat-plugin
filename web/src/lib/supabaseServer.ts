import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

/** Server-side Supabase client with read-only cookie bridge */
export async function getSupabaseServer() {
  const jar = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return jar.get(name)?.value;
        },
        set(_n: string, _v: string, _o?: CookieOptions) {},
        remove(_n: string, _o?: CookieOptions) {},
      },
    }
  );
}
