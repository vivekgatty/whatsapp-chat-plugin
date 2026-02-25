"use client";
import { createClient } from "@supabase/supabase-js";

export default function SignOutButton() {
  return (
    <button
      onClick={async () => {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (!supabaseUrl || !supabaseAnonKey) return;

        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        await supabase.auth.signOut();
        window.location.href = "/login";
      }}
      className="rounded-md bg-white/10 px-3 py-2 text-sm hover:bg-white/20"
    >
      Sign out
    </button>
  );
}
