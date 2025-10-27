import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") || "/dashboard";

  // Prepare a response we can mutate cookies on
  const res = NextResponse.redirect(new URL(next, url.origin));

  if (!code) {
    res.headers.set("location", new URL("/login?error=missing_code", url.origin).toString());
    return res;
  }

  const cookieStore = await cookies(); // async in Next 15

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          res.cookies.set(name, value, options);
        },
        remove(name, options) {
          res.cookies.set(name, "", { ...options, maxAge: 0 });
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error("exchangeCodeForSession:", error);
    res.headers.set(
      "location",
      new URL(`/login?error=${encodeURIComponent(error.message)}&redirectedFrom=${encodeURIComponent(next)}`, url.origin).toString()
    );
  }

  return res;
}
