/** stamp: 2025-11-01_08-30-23 */
export const runtime = "nodejs";
export async function GET() {
  try {
    const business = {
      id: process.env.DEFAULT_BUSINESS_ID ?? null,
      name: null,
      website: "https://chatmadi.com",
      email: "admin@chatmadi.com",
      phone: "9591428002",
    };
    // Return a benign, always-OK payload so the UI can't crash.
    return Response.json({ ok: true, plan: "free", used: 0, quota: 100, business }, { status: 200 });
  } catch (e:any) {
    return Response.json({ ok: false, plan: "free", used: 0, quota: 100, business: null, error: String(e?.message ?? e) }, { status: 200 });
  }
}