import { NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * Lightweight auth-status probe.
 * We consider the user "authed" if a Supabase auth cookie exists.
 * Supabase sets cookies like: sb-<project-ref>-auth-token (and others).
 * This avoids creating a Supabase server client and sidesteps typing/env pitfalls.
 */
export async function GET() {
  const store = cookies();

  // Look for any Supabase auth cookie with a non-empty value
  const authed = store
    .getAll()
    .some((c) => /^sb-.*-auth-token$/.test(c.name) && Boolean(c.value));

  return NextResponse.json({ authed });
}
