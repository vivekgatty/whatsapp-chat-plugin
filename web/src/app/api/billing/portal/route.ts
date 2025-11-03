export const runtime = "nodejs";

// Minimal, robust redirect using the Web Response API (avoids NextResponse quirks)
async function handle() {
  try {
    const url = process.env.RAZORPAY_CUSTOMER_PORTAL_URL;
    if (!url) {
      return new Response(JSON.stringify({ ok: false, error: "portal_url_not_configured" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }
    return Response.redirect(url, 302); // 302: temporary redirect
  } catch (err) {
    return new Response(
      JSON.stringify({ ok: false, error: "unexpected_error", message: String(err) }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
}

export const GET = handle;
export const POST = handle;
