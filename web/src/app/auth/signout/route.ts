import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
export const runtime = "nodejs";

export async function POST(req: Request) {
  const url = new URL(req.url);
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => cookieStore.get(name)?.value,
        set: (name, value, options) => cookieStore.set({ name, value, ...options }),
        remove: (name, options) => cookieStore.set({ name, value: "", ...options, maxAge: 0 }),
      },
    }
  );
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/login", url.origin));
}
