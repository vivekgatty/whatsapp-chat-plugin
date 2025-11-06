import { createClient } from "@supabase/supabase-js";

/**
 * Single canonical factory for the Supabase admin client.
 * We export it under multiple names to stay compatible with all import styles
 * used across the project (default, getSupabaseAdmin, adminClient).
 */
export function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE || "";
  if (!url || !serviceRole) {
    throw new Error(
      "Supabase env missing: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE"
    );
  }
  return createClient(url, serviceRole, { auth: { persistSession: false } });
}

// Back-compat named exports used elsewhere in the repo.
export { supabaseAdmin as getSupabaseAdmin };
export { supabaseAdmin as adminClient };

// Default export also supported.
export default supabaseAdmin;
