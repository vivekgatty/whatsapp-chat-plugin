import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { OrderForm } from "../components/OrderForm";
import { PaymentLinkButton } from "../components/PaymentLinkButton";

interface Props {
  params: Promise<{ orderId: string }>;
}

export default async function OrderDetailPage({ params }: Props) {
  const { orderId } = await params;
  const supabase = createClient();

  const { data: order } = await supabase
    .from("orders")
    .select("*, contacts(*)")
    .eq("id", orderId)
    .single();

  if (!order) redirect("/orders");

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{order.order_number}</h1>
          <p className="text-sm text-gray-500">{order.title ?? order.order_type}</p>
        </div>
        <PaymentLinkButton orderId={orderId} amount={order.total_amount} />
      </div>
      <OrderForm order={order} />
    </div>
  );
}
