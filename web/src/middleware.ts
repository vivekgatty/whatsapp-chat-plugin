// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Refresh session on every request (keeps cookies in sync)
  const supabase = createMiddlewareClient({ req, res });
  await supabase.auth.getSession();

  // Gate all /dashboard pages
  if (req.nextUrl.pathname.startsWith("/dashboard")) {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirectedFrom", req.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return res;
}

// Only run on these paths
export const config = {
  matcher: ["/dashboard/:path*"],
};
