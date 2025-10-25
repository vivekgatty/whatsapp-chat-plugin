// src/lib/supabase/server.ts
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client for Next.js App Router.
 * Uses the anon key via @supabase/auth-helpers-nextjs and cookie-based auth.
 */
export function createClient(): SupabaseClient {
  const cookieStore = cookies();
  return createServerComponentClient({
    cookies: () => cookieStore,
  });
}

// Back-compat for older imports
export const getServerSupabase = createClient;
