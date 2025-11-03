import { createClient as supaCreateClient } from "@supabase/supabase-js";

/**
 * RSC/server-safe anon client for requests that do NOT need service role.
 * Uses NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) + NEXT_PUBLIC_SUPABASE_ANON_KEY.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anon) {
    throw new Error(
      "Public Supabase envs missing: set NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) and NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  return supaCreateClient(url, anon, {
    auth: { persistSession: false },
  });
}
