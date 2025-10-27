import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);

  // raw ?next= might be "%2Fdashboard" – normalize to "/dashboard"
  const rawNext = url.searchParams.get("next") ?? "/dashboard";
  const nextPath = (() => {
    try {
      const d = decodeURIComponent(rawNext);
      return d.startsWith("/") ? d : "/dashboard";
    } catch {
      return rawNext.startsWith("/") ? rawNext : "/dashboard";
    }
  })();

  const code = url.searchParams.get("code");
  if (!code) {
    console.error("auth/callback: missing code");
    return NextResponse.redirect(
      new URL(`/login?error=missing_code&redirectedFrom=${encodeURIComponent(nextPath)}`, url.origin)
    );
  }

  // Build the redirect *first* so we can attach cookies to it
  const redirectRes = NextResponse.redirect(new URL(nextPath, url.origin));
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
          redirectRes.cookies.set(name, value, options as any);
        },
        remove(name: string, options: CookieOptions) {
          redirectRes.cookies.set(name, "", { ...(options as any), maxAge: 0 });
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error("auth/callback: exchange error", error.message);
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error.message)}&redirectedFrom=${encodeURIComponent(nextPath)}`, url.origin)
    );
  }

  return redirectRes;
}