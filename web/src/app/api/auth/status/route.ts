import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";

/**
 * Lightweight auth-status probe.
 * We consider the user "authed" if any Supabase auth cookie exists.
 * Matches cookies like: sb-<project-ref>-auth-token / -refresh-token / -access-token.
 * Works across Next 15 runtimes by awaiting cookies() and falling back to header parsing.
 */
export async function GET() {
  const store = await cookies(); // Next 15 can type this as Promise
  const list = typeof store.getAll === "function" ? store.getAll() : [];

  const nameRe = /^sb-.*-(auth|access|refresh)-token$/;

  // Primary: use structured cookies API
  const hitFromStore = list.some((c) => nameRe.test(c.name) && !!c.value);

  // Fallback: parse raw Cookie header if getAll() is unavailable
  const hdr = await headers();
  const cookieHeader = hdr.get("cookie") || "";
  const hitFromHeader = nameRe.test(cookieHeader);

  const authed = hitFromStore || hitFromHeader;

  return NextResponse.json({ authed });
}
