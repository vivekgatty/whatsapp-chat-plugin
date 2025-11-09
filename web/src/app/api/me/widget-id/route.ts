import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import supabaseAdmin from "@/lib/supabaseAdmin";

// Used only if we cannot resolve a user or create a per-user widget
const FALLBACK_WIDGET = "bcd51dd2-e61b-41d1-8848-9788eb8d1881";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 1) Resolve the logged-in Supabase user from cookies (SSR client)
    const jar = await cookies(); // Next 15 types treat this as Promise<ReadonlyRequestCookies>
    const supa = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return jar.get(name)?.value;
          },
          set() {/* not needed in this route */},
          remove() {/* not needed in this route */},
        },
      }
    );

    const { data: userData } = await supa.auth.getUser();
    const user = userData?.user || null;

    // If no authenticated user, keep the global fallback
    if (!user) {
      return NextResponse.json({ widgetId: FALLBACK_WIDGET, source: "fallback_no_user" });
    }

    const db = supabaseAdmin();

    // 2) If this user already has a widget, return it
    let { data: wExisting, error: wExistErr } = await db
      .from("widgets")
      .select("id,business_id")
      .eq("owner_user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (wExistErr) {
      return NextResponse.json({ widgetId: FALLBACK_WIDGET, source: "fallback_read_error" });
    }
    if (wExisting?.id) {
      return NextResponse.json({ widgetId: wExisting.id, source: "owner_match" });
    }

    // 3) No widget yet for this user → ensure a starter business, then create a widget
    let businessId: string | null = null;

    // Try find business by owner_user_id, then by email (if present)
    let tryOwner = await db
      .from("businesses")
      .select("id,owner_user_id,email")
      .eq("owner_user_id", user.id)
      .limit(1)
      .maybeSingle();

    if (tryOwner.data?.id) {
      businessId = tryOwner.data.id as string;
    } else if (user.email) {
      const byEmail = await db
        .from("businesses")
        .select("id,email")
        .eq("email", user.email)
        .limit(1)
        .maybeSingle();
      if (byEmail.data?.id) {
        businessId = byEmail.data.id as string;
      }
    }

    // Create a minimal starter business if still none
    if (!businessId) {
      const friendly = (user.email?.split("@")[0] || "My").replace(/[^a-zA-Z0-9 _.-]/g, "");
      const { data: bNew, error: bErr } = await db
        .from("businesses")
        .insert({ name: `${friendly}'s Business`, email: user.email ?? null, plan: "starter", owner_user_id: user.id } as any)
        .select("id")
        .single();

      if (bErr || !bNew?.id) {
        return NextResponse.json({ widgetId: FALLBACK_WIDGET, source: "fallback_business_create" });
      }
      businessId = bNew.id as string;
    }

    // Create this user's widget tied to that business
    const { data: wNew, error: wNewErr } = await db
      .from("widgets")
      .insert({ business_id: businessId, owner_user_id: user.id })
      .select("id")
      .single();

    if (wNewErr || !wNew?.id) {
      return NextResponse.json({ widgetId: FALLBACK_WIDGET, source: "fallback_widget_create" });
    }

    return NextResponse.json({ widgetId: wNew.id as string, source: "new_for_user" });
  } catch (err: any) {
    return NextResponse.json(
      { widgetId: FALLBACK_WIDGET, source: "fallback_exception", message: String(err?.message || err) },
      { status: 200 }
    );
  }
}