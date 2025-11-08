import { NextRequest, NextResponse } from "next/server";

const PROTECTED_PREFIXES = ["/dashboard", "/docs", "/billing"];

function isSignedIn(req: NextRequest): boolean {
  const all = req.cookies.getAll();
  // Supabase v2 sets sb-<project-ref>-auth-token cookie (JSON payload).
  // Also check legacy token names just in case.
  for (const c of all) {
    const n = c.name.toLowerCase();
    if (n.startsWith("sb-") && n.endsWith("-auth-token")) {
      return !!c.value && c.value !== "{}" && c.value !== "null";
    }
    if (n === "sb-access-token" || n.includes("supabase-auth-token")) {
      return !!c.value;
    }
  }
  return false;
}

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const path = url.pathname;
  const authed = isSignedIn(req);

  const isProtected = PROTECTED_PREFIXES.some((p) => path === p || path.startsWith(p + "/"));

  // Gate protected pages when NOT signed in -> bounce to "/" with ?next=
  if (!authed && isProtected) {
    const to = url.clone();
    to.pathname = "/";
    to.searchParams.set("next", path);
    return NextResponse.redirect(to);
  }

  // If signed in and we land on "/" with ?next=..., honor it immediately
  if (authed && path === "/" && url.searchParams.has("next")) {
    const next = url.searchParams.get("next") || "/dashboard/overview";
    return NextResponse.redirect(new URL(next, req.url));
  }

  // If signed in and we hit plain "/" (no next), send to Overview
  if (authed && path === "/") {
    return NextResponse.redirect(new URL("/dashboard/overview", req.url));
  }

  // Otherwise proceed
  return NextResponse.next();
}

export const config = {
  // Run on everything except static assets, images, favicons, and API routes
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|og/.*|api/.*).*)",
  ],
};
