/** stamp: 2025-11-01_07-59-29 */
export const runtime = "nodejs";
export async function GET() {
  try {
    // TODO: replace with a real query to your 'payments' table or Razorpay fetch.
    // For now return an empty list so the page never crashes.
    return Response.json({ ok: true, items: [] }, { status: 200 });
  } catch (e:any) {
    return Response.json({ ok: false, items: [], error: String(e?.message ?? e) }, { status: 200 });
  }
}