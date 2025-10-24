// src/app/auth/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

function redirectWithMessage(origin: string, msg: string, to = "/login") {
  const url = new URL(to, origin);
  url.searchParams.set("message", msg);
  return NextResponse.redirect(url);
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const redirectedFrom = url.searchParams.get("redirectedFrom") || "/dashboard";

  const supabase = createRouteHandlerClient({ cookies });

  // Supabase may send either ?code=... (PKCE/OAuth style) or
  // ?token_hash=...&email=... (email magic-link).
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const email = url.searchParams.get("email");

  try {
    if (code) {
      // IMPORTANT: pass a string (not an object)
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) throw error;
    } else if (tokenHash && email) {
      // Magic link verification (email OTP)
      const { error } = await supabase.auth.verifyOtp({
        type: "email",
        token_hash: tokenHash,
        email,
      });
      if (error) throw error;
    } else {
      return redirectWithMessage(url.origin, "Missing code or token.");
    }
  } catch (err: any) {
    return redirectWithMessage(url.origin, err?.message ?? "Login failed.");
  }

  // Session cookie is set — send them where they intended to go
  return NextResponse.redirect(new URL(redirectedFrom, url.origin));
}
