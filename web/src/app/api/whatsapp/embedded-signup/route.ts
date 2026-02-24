import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json({ error: "Authorization code required" }, { status: 400 });
    }

    // Exchange short-lived code for long-lived token via Meta Graph API
    const tokenRes = await fetch(
      `https://graph.facebook.com/v21.0/oauth/access_token?` +
        `client_id=${process.env.META_APP_ID}` +
        `&client_secret=${process.env.META_APP_SECRET}` +
        `&code=${code}`
    );
    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      return NextResponse.json({ error: "Failed to exchange code for token" }, { status: 400 });
    }

    // TODO: Fetch WABA details, phone number, and business info from Graph API
    // TODO: Store encrypted access token in whatsapp_connections table
    // TODO: Set webhook URL for this WABA

    return NextResponse.json({
      success: true,
      message: "WhatsApp Business connected successfully",
    });
  } catch (error) {
    console.error("Embedded signup error:", error);
    return NextResponse.json({ error: "Failed to complete signup" }, { status: 500 });
  }
}
