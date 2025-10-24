import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const supabase = getServerSupabase();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/login", req.url));
}
