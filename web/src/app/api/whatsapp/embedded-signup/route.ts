import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { encryptToken } from "@/lib/utils/encryption";

const META_API = "https://graph.facebook.com/v19.0";

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

    // 1. Exchange short-lived code for long-lived access token
    const tokenRes = await fetch(
      `${META_API}/oauth/access_token?` +
        `client_id=${process.env.META_APP_ID}` +
        `&client_secret=${process.env.META_APP_SECRET}` +
        `&code=${code}`
    );
    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      return NextResponse.json({ error: "Failed to exchange code for token" }, { status: 400 });
    }

    const accessToken = tokenData.access_token;

    // 2. Get debug info to find the WABA ID
    const debugRes = await fetch(`${META_API}/debug_token?input_token=${accessToken}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const debugData = await debugRes.json();
    const granularScopes = debugData.data?.granular_scopes ?? [];

    const wabaScope = granularScopes.find(
      (s: { scope: string; target_ids: string[] }) => s.scope === "whatsapp_business_management"
    );
    const wabaId = wabaScope?.target_ids?.[0];

    if (!wabaId) {
      return NextResponse.json(
        { error: "Could not determine WABA ID from token scopes" },
        { status: 400 }
      );
    }

    // 3. Get phone numbers associated with this WABA
    const phonesRes = await fetch(
      `${META_API}/${wabaId}/phone_numbers?fields=id,display_phone_number,verified_name,quality_rating,messaging_limit,code_verification_status`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const phonesData = await phonesRes.json();
    const phoneEntry = phonesData.data?.[0];

    if (!phoneEntry) {
      return NextResponse.json({ error: "No phone number found for this WABA" }, { status: 400 });
    }

    // 4. Get WABA business info
    const wabaRes = await fetch(`${META_API}/${wabaId}?fields=name,currency,timezone_id`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const wabaInfo = await wabaRes.json();

    // 5. Find the workspace for this user
    const db = supabaseAdmin();
    const { data: workspace } = await db
      .from("workspaces")
      .select("id")
      .eq("owner_id", user.id)
      .single();

    if (!workspace) {
      return NextResponse.json(
        { error: "No workspace found. Complete signup first." },
        { status: 400 }
      );
    }

    // 6. Encrypt and store the connection
    const encryptedToken = encryptToken(accessToken);

    await db.from("whatsapp_connections").upsert(
      {
        workspace_id: workspace.id,
        phone_number_id: phoneEntry.id,
        phone_number: phoneEntry.display_phone_number?.replace(/\D/g, ""),
        display_phone_number: phoneEntry.display_phone_number,
        waba_id: wabaId,
        business_name: wabaInfo.name ?? phoneEntry.verified_name,
        access_token: encryptedToken,
        webhook_verified: false,
        quality_rating: phoneEntry.quality_rating ?? "GREEN",
        messaging_limit: phoneEntry.messaging_limit ?? "TIER_NOT_SET",
        status: "active",
        connected_at: new Date().toISOString(),
        meta_embedded_signup_data: {
          waba_info: wabaInfo,
          phone_info: phoneEntry,
          scopes: granularScopes,
        },
      },
      { onConflict: "workspace_id" }
    );

    // 7. Update workspace onboarding step
    await db
      .from("workspaces")
      .update({ onboarding_step: "business_profile" })
      .eq("id", workspace.id);

    return NextResponse.json({
      success: true,
      wabaId,
      phoneNumberId: phoneEntry.id,
      phoneNumber: phoneEntry.display_phone_number,
      businessName: wabaInfo.name ?? phoneEntry.verified_name,
    });
  } catch (error) {
    console.error("Embedded signup error:", error);
    return NextResponse.json({ error: "Failed to complete signup" }, { status: 500 });
  }
}
