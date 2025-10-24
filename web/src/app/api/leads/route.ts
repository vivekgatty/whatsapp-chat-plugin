// src/app/api/leads/route.ts
// Complete, drop-in file. No manual edits needed elsewhere.

import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { google } from "googleapis";

export const runtime = "nodejs"; // Google APIs need Node, not Edge.

// --------------------------
// Env / clients
// --------------------------
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  "";

const SHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID || "";
const SHEET_TAB = "leads"; // lowercase, exactly matches your tab.
const G_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL || "";
const G_PRIVATE_KEY = (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n");

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Google Sheets client (lazy)
function getSheets() {
  if (!SHEET_ID || !G_CLIENT_EMAIL || !G_PRIVATE_KEY) return null;
  const auth = new google.auth.JWT({
    email: G_CLIENT_EMAIL,
    key: G_PRIVATE_KEY,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth });
}

// Ensure header row exists (idempotent)
async function ensureHeaders() {
  const sheets = getSheets();
  if (!sheets) return { ok: false, error: "sheets disabled" };

  const headers = [
    "created_at",
    "id",
    "business_id",
    "widget_id",
    "name",
    "message",
    "page_url",
    "referrer",
    "user_agent",
    "wa_number",
    "meta_json",
  ];

  // Read first row
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_TAB}!A1:K1`,
  });

  const row0 = res.data.values?.[0] || [];
  const match =
    row0.length === headers.length &&
    row0.every((h, i) => (h || "").toString().trim() === headers[i]);

  if (match) return { ok: true };

  // Put headers in A1:K1
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_TAB}!A1:K1`,
    valueInputOption: "RAW",
    requestBody: { values: [headers] },
  });

  return { ok: true, wrote: true };
}

type LeadIn = {
  business_id?: string | null;
  widget_id?: string;
  name?: string | null;
  message?: string | null;
  page_url?: string | null;
  referrer?: string | null;
  user_agent?: string | null;
  wa_number?: string | null;
  meta?: any;
};

type LeadRow = {
  id: string;
  created_at: string;
  business_id: string;
  widget_id: string | null;
  name: string | null;
  message: string | null;
  page_url: string | null;
  referrer: string | null;
  user_agent: string | null;
  wa_number: string | null;
  meta_json: string;
};

// Append one lead row to Sheet
async function appendToSheet(row: LeadRow) {
  const sheets = getSheets();
  if (!sheets) return { ok: false, error: "sheets disabled" };

  // Make sure headers exist
  await ensureHeaders();

  const values = [
    [
      row.created_at,
      row.id,
      row.business_id,
      row.widget_id,
      row.name,
      row.message,
      row.page_url,
      row.referrer,
      row.user_agent,
      row.wa_number,
      row.meta_json,
    ],
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_TAB}!A:A`,
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values },
  });

  return { ok: true };
}

// Resolve business_id from widgets if not provided
async function resolveBusinessId(partial: LeadIn) {
  if (partial.business_id) return partial.business_id;
  if (!partial.widget_id) return null;

  const { data, error } = await supabase
    .from("widgets")
    .select("business_id")
    .eq("id", partial.widget_id)
    .maybeSingle();

  if (error) {
    console.error("widgets lookup error", error);
    return null;
  }
  return data?.business_id ?? null;
}

// --------------------------
// GET = health + (optional) probe to Sheet
// --------------------------
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const debug = url.searchParams.get("debug");

  const env = {
    hasUrl: !!SUPABASE_URL,
    hasKey: !!SUPABASE_KEY,
    sheetsConfigured: !!(SHEET_ID && G_CLIENT_EMAIL && G_PRIVATE_KEY),
    urlPreview: SUPABASE_URL ? SUPABASE_URL.replace(/:\/\/.*/, "://…") : null,
    keyPreview: SUPABASE_KEY ? SUPABASE_KEY.slice(0, 10) + "…" : null,
  };

  let probe: any = null;
  if (debug === "1" && env.sheetsConfigured) {
    try {
      await ensureHeaders();
      await getSheets()!.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        range: `${SHEET_TAB}!A:A`,
        valueInputOption: "RAW",
        insertDataOption: "INSERT_ROWS",
        requestBody: { values: [["probe", `${new Date().toISOString()}: health check`]] },
      });
      probe = { ok: true };
    } catch (e: any) {
      console.error("sheets probe error", e?.message || e);
      probe = { ok: false, error: e?.message || String(e) };
    }
  }

  return Response.json({ ok: true, health: "leads endpoint alive", env, probe });
}

// --------------------------
// POST = create lead (DB + optional Sheet mirror)
// --------------------------
export async function POST(req: NextRequest) {
  let body: LeadIn;
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: "Bad JSON" }, { status: 400 });
  }

  // Basic validation
  const widget_id = (body.widget_id || "").toString();
  if (!widget_id) {
    return Response.json(
      { ok: false, error: "widget_id is required" },
      { status: 400 }
    );
  }

  // Guarantee business_id
  const business_id = await resolveBusinessId(body);
  if (!business_id) {
    return Response.json(
      { ok: false, supabaseError: 'Missing business_id (no matching widget_id)' },
      { status: 400 }
    );
  }

  // Insert into Supabase
  const insertRow = {
    business_id,
    widget_id,
    name: body.name ?? null,
    message: body.message ?? null,
    page_url: body.page_url ?? null,
    referrer: body.referrer ?? null,
    user_agent: body.user_agent ?? null,
    wa_number: body.wa_number ?? null,
    meta: body.meta ?? {},
  };

  const { data, error } = await supabase
    .from("leads")
    .insert(insertRow)
    .select("id, created_at")
    .single();

  if (error) {
    console.error("supabase insert error", error);
    return Response.json(
      { ok: false, supabaseError: error.message },
      { status: 400 }
    );
  }

  // Mirror to Google Sheets (best-effort)
  let sheet: { ok: boolean; error?: string } | null = null;
  if (SHEET_ID && G_CLIENT_EMAIL && G_PRIVATE_KEY) {
    try {
      const row: LeadRow = {
        id: data.id,
        created_at: data.created_at,
        business_id,
        widget_id,
        name: insertRow.name,
        message: insertRow.message,
        page_url: insertRow.page_url,
        referrer: insertRow.referrer,
        user_agent: insertRow.user_agent,
        wa_number: insertRow.wa_number,
        meta_json: JSON.stringify(insertRow.meta ?? {}),
      };
      await appendToSheet(row);
      sheet = { ok: true };
    } catch (e: any) {
      console.error("sheets append error", e?.message || e);
      sheet = { ok: false, error: e?.message || String(e) };
    }
  }

  // CORS-friendly minimal response
  return Response.json({ ok: true, id: data.id, sheet });
}

// --------------------------
// CORS preflight
// --------------------------
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST,GET,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    },
  });
}
