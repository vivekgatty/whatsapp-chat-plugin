import { createClient } from "@supabase/supabase-js";

export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||      // fallback if you used a different name
    "";

  if (!url || !key) {
    throw new Error("Supabase admin envs missing: set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  }

  // No session persistence needed in server routes
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
