import { createClient } from "@supabase/supabase-js";

/** Build the service-role Supabase client at request time. */
export function getSupabaseAdmin() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    "";

  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "";

  if (!url) {
    throw new Error("SUPABASE URL missing. Add NEXT_PUBLIC_SUPABASE_URL in Vercel → Settings → Environment Variables.");
  }
  if (!serviceKey) {
    throw new Error("Service Role key missing. Add SUPABASE_SERVICE_ROLE (or SUPABASE_SERVICE_ROLE_KEY) in Vercel env.");
  }

  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
