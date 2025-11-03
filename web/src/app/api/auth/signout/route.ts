export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "../../../../lib/supabaseServer";

export async function POST(req: NextRequest) {
  const supa = await getSupabaseServer();
  try {
    await supa.auth.signOut();
  } catch {}
  return NextResponse.redirect(new URL("/", req.url), { status: 302 });
}
