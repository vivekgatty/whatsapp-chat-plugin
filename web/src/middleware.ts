import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Paths that require an authenticated session.
const PROTECTED = ["/dashboard", "/docs", "/billing"];

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Only act on protected prefixes
  const needsAuth = PROTECTED.some((p) => pathname.startsWith(p));
  if (!needsAuth) return NextResponse.next();

  // Supabase sets cookies like: sb-<project>-auth-token
  const hasSession = req.cookies
    .getAll()
    .some((c) => /^sb-.*-auth-token$/.test(c.name) && Boolean(c.value));

  if (hasSession) return NextResponse.next();

  // Not authed → send to /?next=<original>
  const url = new URL("/", req.url);
  url.searchParams.set("next", pathname + search);
  return NextResponse.redirect(url);
}

// Only run on protected routes (avoids assets/_next)
export const config = {
  matcher: ["/dashboard/:path*", "/docs/:path*", "/billing/:path*"],
};
