import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const redirectedFrom = url.searchParams.get("redirectedFrom") || "/dashboard";

  // Prepare the redirect response up front (we'll attach cookies to it)
  const res = NextResponse.redirect(new URL(redirectedFrom, url.origin));

  // NOTE: In Next 15 this may be async; awaiting works across versions.
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          res.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          res.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const code = url.searchParams.get("code");
  if (code) {
    // Exchange the code for a session and set cookies on the response
    await supabase.auth.exchangeCodeForSession(code);
  }

  return res;
}
