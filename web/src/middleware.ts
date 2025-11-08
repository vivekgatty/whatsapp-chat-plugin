import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export const config = {
  matcher: ["/dashboard/:path*", "/docs/:path*"],
};

export async function middleware(req: NextRequest) {
  // Prepare a mutable response so Supabase can update cookies if needed
  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => req.cookies.get(name)?.value,
        set: (name: string, value: string, options: any) => {
          res.cookies.set({ name, value, ...options });
        },
        remove: (name: string, options: any) => {
          res.cookies.set({ name, value: "", ...options, maxAge: 0 });
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    const loginURL = new URL("/", req.url);
    // Preserve intended destination so we can send them back after login
    loginURL.searchParams.set(
      "next",
      req.nextUrl.pathname + (req.nextUrl.search || "")
    );
    return NextResponse.redirect(loginURL);
  }

  return res;
}
