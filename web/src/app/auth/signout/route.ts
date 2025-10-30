import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
export const runtime = "nodejs";

export async function POST(req: Request) {
  const url = new URL(req.url);
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { cookies });
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/login", url.origin));
}
