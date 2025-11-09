import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import supabaseAdmin from "../../../../lib/supabaseAdmin";

export const runtime = "nodejs"; // Buffer is needed for JWT decode

const FALLBACK_WIDGET = "bcd51dd2-e61b-41d1-8848-9788eb8d1881";

// Minimal base64url -> JSON helper for JWT payload
function decodeJwtSub(token: string): string | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = JSON.parse(Buffer.from(payload, "base64").toString("utf8"));
    return typeof json?.sub === "string" ? json.sub : null;
  } catch {
    return null;
  }
}

async function findSupabaseAccessToken(): Promise<string | null> {
  // Next.js 15: cookies() is async
  const jar = await cookies();
  const all = jar.getAll();
  const known = ["sb-access-token", "sb:token", "supabase-auth-token"];
  for (const name of known) {
    const c = all.find((x) => x.name === name);
    if (c?.value) return c.value;
  }
  const loose = all.find((x) => /access[-_]token/i.test(x.name));
  return loose?.value ?? null;
}

export async function GET() {
  try {
    // 1) Try Supabase auth cookie
    let userId: string | null = null;
    const tok = await findSupabaseAccessToken();
    if (tok) userId = decodeJwtSub(tok);

    // 2) Header override (x-user-id). In Next 15, headers() may be async too.
    if (!userId) {
      const h = await headers();
      const hdr = h.get("x-user-id");
      if (hdr && /^[0-9a-fA-F-]{36}$/.test(hdr)) userId = hdr;
    }

    if (!userId) {
      return NextResponse.json(
        { widgetId: FALLBACK_WIDGET, source: "fallback" },
        { status: 200 }
      );
    }

    // 3) Map (or fetch) the user's widget
    const db = supabaseAdmin();
    const { data: wid, error } = await db.rpc("get_or_map_widget_for_user", {
      p_user_id: userId,
      p_fallback_widget: FALLBACK_WIDGET,
    });

    if (error) {
      return NextResponse.json(
        { widgetId: FALLBACK_WIDGET, source: "rpc_error", detail: error.message },
        { status: 200 }
      );
    }

    const widgetId =
      typeof wid === "string" && /^[0-9a-fA-F-]{36}$/.test(wid)
        ? wid
        : FALLBACK_WIDGET;

    return NextResponse.json({ widgetId, source: "user_mapping" }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { widgetId: FALLBACK_WIDGET, source: "route_error", detail: String(err?.message || err) },
      { status: 200 }
    );
  }
}
