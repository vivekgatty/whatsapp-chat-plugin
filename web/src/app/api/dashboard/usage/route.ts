export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse, NextRequest } from "next/server";
import { getSupabaseServer } from "../../../../lib/supabaseServer";
import { getUsage } from "../../../../lib/plan";

export async function GET(_req: NextRequest) {
  try {
    const supa = await getSupabaseServer();
    const { data: { user } } = await supa.auth.getUser();
    if (!user) return NextResponse.json({ ok: false, error: "unauthenticated" }, { status: 401 });

    // Find a widget for this user: prefer owner_user_id, fallback to any
    let widgetId: string | null = null;

    const byOwner = await supa.from("widgets").select("id").eq("owner_user_id", user.id).limit(1).maybeSingle();
    if (byOwner?.data?.id) widgetId = byOwner.data.id;

    if (!widgetId) {
      const anyW = await supa.from("widgets").select("id").limit(1).maybeSingle();
      if (anyW?.data?.id) widgetId = anyW.data.id;
    }

    if (!widgetId) return NextResponse.json({ ok: true, usage: null });

    const usage = await getUsage(supa, widgetId, "message");
    return NextResponse.json({ ok: true, usage, widget_id: widgetId });
  } catch (e: any) {
    console.warn("GET /api/dashboard/usage:", e?.message || e);
    return NextResponse.json({ ok: false, error: "unexpected_error" }, { status: 500 });
  }
}