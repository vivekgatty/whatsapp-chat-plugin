import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createPaymentLink } from "@/lib/razorpay/payment-links";

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId, amount, description } = await request.json();

    const { data: order } = await supabase
      .from("orders")
      .select("*, contacts(name, phone, email)")
      .eq("id", orderId)
      .single();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const link = await createPaymentLink({
      amount: Math.round((amount ?? order.total_amount) * 100),
      currency: order.currency ?? "INR",
      description: description ?? `Payment for ${order.order_number}`,
      customerName: order.contacts?.name ?? undefined,
      customerEmail: order.contacts?.email ?? undefined,
      customerPhone: order.contacts?.phone ?? undefined,
      orderId: order.order_number,
    });

    await supabase
      .from("orders")
      .update({
        razorpay_payment_link_id: link.id,
        razorpay_payment_link_url: link.short_url,
      })
      .eq("id", orderId);

    await supabase.from("payment_links").insert({
      workspace_id: order.workspace_id,
      contact_id: order.contact_id,
      order_id: orderId,
      amount: amount ?? order.total_amount,
      description: description ?? `Payment for ${order.order_number}`,
      razorpay_payment_link_id: link.id,
      razorpay_payment_link_url: link.short_url,
      short_url: link.short_url,
      status: "created",
    });

    return NextResponse.json({ url: link.short_url, id: link.id });
  } catch (error) {
    console.error("Payment link error:", error);
    return NextResponse.json({ error: "Failed to create payment link" }, { status: 500 });
  }
}
