import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/getSupabaseAdmin()";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  // ...verify Razorpay signature first...
  const supabase = getSupabaseAdmin(); // <-- build it here, at request time
  // ...write to DB...
  return NextResponse.json({ ok: true });
}

