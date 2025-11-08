import { NextRequest, NextResponse } from "next/server";

const PROTECTED_PREFIXES = ["/dashboard", "/docs"];

// Detect Supabase auth cookie (sb-<ref>-auth-token) without importing Supabase at the edge.
function isAuthed(req: NextRequest): boolean {
  try {
    return req.cookies
      .getAll()
      .some((c) => /^sb-.*-auth-token$/.test(c.name) && Boolean(c.value));
  } catch {
    return false;
  }
}

export function middleware(req: NextRequest) {
  const url = new URL(req.url);
  const path = url.pathname;
  const authed = isAuthed(req);
  const wantsProtected = PROTECTED_PREFIXES.some((p) => path.startsWith(p));

  // Unauthed trying to hit protected -> send to "/" with ?next=...
  if (!authed && wantsProtected) {
    const nextTarget = path + url.search + url.hash;
    const dest = new URL("/", req.url);
    dest.searchParams.set("next", nextTarget);
    return NextResponse.redirect(dest);
  }

  // Authed landing on "/" (or "/login") -> go to dashboard/overview or decoded ?next=
  if (authed && (path === "/" || path === "/login")) {
    const nextParam = url.searchParams.get("next");
    const to = nextParam ? decodeURIComponent(nextParam) : "/dashboard/overview";
    const dest = new URL(to, req.url);
    // Ensure no lingering ?next= in final URL
    if (nextParam) dest.search = "";
    return NextResponse.redirect(dest);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",          // home/login
    "/login",     // if you add a distinct login route later
    "/dashboard/:path*", 
    "/docs/:path*",
  ],
};
