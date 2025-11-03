import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") || "/dashboard";

  if (!code) {
    return NextResponse.redirect(
      new URL(`/login?error=missing_code&redirectedFrom=${encodeURIComponent(next)}`, url.origin)
    );
  }

  // Pre-create the redirect response and WRITE COOKIES ON THIS RESPONSE
  const res = NextResponse.redirect(new URL(next, url.origin));
  const store = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return store.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          res.cookies.set(name, value, options as any);
        },
        remove(name: string, options: CookieOptions) {
          res.cookies.set(name, "", { ...(options as any), maxAge: 0 });
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent(error.message)}&redirectedFrom=${encodeURIComponent(next)}`,
        url.origin
      )
    );
  }

  // Return the SAME response that has the Set-Cookie headers
  return res;
}
