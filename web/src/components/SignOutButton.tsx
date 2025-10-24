'use client'
import { createClient } from '@supabase/supabase-js'

export default function SignOutButton() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  return (
    <button
      onClick={async () => {
        await supabase.auth.signOut()
        window.location.href = '/login'
      }}
      className="rounded-md bg-white/10 hover:bg-white/20 px-3 py-2 text-sm"
    >
      Sign out
    </button>
  )
}
