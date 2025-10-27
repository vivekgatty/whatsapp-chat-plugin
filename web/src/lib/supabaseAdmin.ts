import { createClient as supaCreateClient } from "@supabase/supabase-js";

/**
 * Admin client (server-only). Uses:
 *  - NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL as fallback)
 *  - SUPABASE_SERVICE_ROLE
 */
export function getSupabaseAdmin() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    process.env.SUPABASE_URL;

  const key = process.env.SUPABASE_SERVICE_ROLE;

  if (!url || !key) {
    throw new Error(
      "Supabase admin envs missing: set NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) and SUPABASE_SERVICE_ROLE"
    );
  }

  return supaCreateClient(url, key, {
    auth: { persistSession: false },
  });
}