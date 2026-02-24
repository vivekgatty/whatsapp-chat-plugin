import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-razorpay-signature") ?? "";
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET ?? "";

    const expectedSignature = crypto.createHmac("sha256", secret).update(body).digest("hex");

    if (signature !== expectedSignature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(body);
    const supabase = createClient();

    switch (event.event) {
      case "payment_link.paid": {
        const linkId = event.payload?.payment_link?.entity?.id;
        if (linkId) {
          await supabase
            .from("payment_links")
            .update({
              status: "paid",
              paid_at: new Date().toISOString(),
              razorpay_payment_id: event.payload?.payment?.entity?.id ?? null,
            })
            .eq("razorpay_payment_link_id", linkId);

          const { data: paymentLink } = await supabase
            .from("payment_links")
            .select("order_id")
            .eq("razorpay_payment_link_id", linkId)
            .single();

          if (paymentLink?.order_id) {
            await supabase
              .from("orders")
              .update({
                payment_status: "paid",
                paid_at: new Date().toISOString(),
              })
              .eq("id", paymentLink.order_id);
          }
        }
        break;
      }

      case "subscription.activated": {
        const subId = event.payload?.subscription?.entity?.id;
        if (subId) {
          await supabase
            .from("workspaces")
            .update({ subscription_status: "active" })
            .eq("razorpay_subscription_id", subId);
        }
        break;
      }

      case "subscription.cancelled": {
        const subId = event.payload?.subscription?.entity?.id;
        if (subId) {
          await supabase
            .from("workspaces")
            .update({ subscription_status: "canceled" })
            .eq("razorpay_subscription_id", subId);
        }
        break;
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Razorpay webhook error:", error);
    return NextResponse.json({ status: "ok" });
  }
}
