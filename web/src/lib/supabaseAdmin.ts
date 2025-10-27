import { createClient } from "@supabase/supabase-js";

/**
 * Build the service-role Supabase client on demand.
 * Avoids throwing during Next build because nothing runs at import time.
 */
export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE;

  if (!url) throw new Error("SUPABASE URL missing");
  if (!serviceKey) throw new Error("SUPABASE SERVICE ROLE key missing");

  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
