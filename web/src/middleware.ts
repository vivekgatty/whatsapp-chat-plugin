import { NextRequest, NextResponse } from "next/server";
import { createMiddlewareClient } from "@supabase/ssr";

const PROTECTED_PREFIXES = ["/dashboard", "/docs", "/billing"];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  // Supabase session check (edge-safe)
  const supabase = createMiddlewareClient({ req, res });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const url = req.nextUrl;
  const path = url.pathname;

  const isProtected = PROTECTED_PREFIXES.some((p) => path.startsWith(p));

  // 1) Gate protected pages when NOT signed in -> bounce to "/" with ?next=
  if (!session && isProtected) {
    const to = url.clone();
    to.pathname = "/";
    to.searchParams.set("next", path);
    return NextResponse.redirect(to);
  }

  // 2) If signed in and we land on "/" with ?next=..., honor it immediately
  if (session && path === "/" && url.searchParams.has("next")) {
    const next = url.searchParams.get("next") || "/dashboard/overview";
    return NextResponse.redirect(new URL(next, req.url));
  }

  // 3) If signed in and we hit plain "/" (no next), send to Overview
  if (session && path === "/") {
    return NextResponse.redirect(new URL("/dashboard/overview", req.url));
  }

  // Otherwise proceed
  return res;
}

export const config = {
  // Run on everything except static assets, images, favicons, and API routes
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|og/.*|api/.*).*)",
  ],
};
