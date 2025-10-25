// src/app/api/profile/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export const runtime = "nodejs";

// Create a Supabase server client wired to Next.js cookies (Next 15: cookies() is async)
async function getSupabase() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // Next 15 mutating cookies API
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: "", ...options, maxAge: 0 });
        },
      },
    }
  );

  return supabase;
}

// GET: return the signed-in user's minimal profile (or null if not signed in)
export async function GET() {
  try {
    const supabase = await getSupabase();
    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user ?? null;

    if (!user) {
      return NextResponse.json({ ok: true, profile: null });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, full_name, company")
      .eq("id", user.id)
      .maybeSingle();

    return NextResponse.json({ ok: true, profile: profile ?? null });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "server error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

// POST: upsert a couple of common profile fields for the signed-in user
export async function POST(req: Request) {
  try {
    const supabase = await getSupabase();
    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user ?? null;

    if (!user) {
      return NextResponse.json({ ok: false, error: "not authenticated" }, { status: 401 });
    }

    const body = (await req.json()) as Partial<{
      full_name: string | null;
      company: string | null;
    }>;

    const updates = {
      id: user.id,
      full_name: body.full_name ?? null,
      company: body.company ?? null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("profiles").upsert(updates).select().single();
    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "server error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
