import { getRazorpayClient } from "./client";

interface CreatePaymentLinkInput {
  amount: number;
  currency: string;
  description: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  orderId?: string;
}

interface PaymentLinkResult {
  id: string;
  short_url: string;
  status: string;
}

export async function createPaymentLink(input: CreatePaymentLinkInput): Promise<PaymentLinkResult> {
  const razorpay = getRazorpayClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const params: Record<string, any> = {
    amount: input.amount,
    currency: input.currency,
    description: input.description,
    callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/orders`,
    callback_method: "get",
  };

  if (input.orderId) {
    params.reference_id = input.orderId;
  }

  if (input.customerName || input.customerEmail || input.customerPhone) {
    params.customer = {
      name: input.customerName ?? "",
      email: input.customerEmail ?? "",
      contact: input.customerPhone ?? "",
    };
  }

  const link = await razorpay.paymentLink.create(
    params as Parameters<typeof razorpay.paymentLink.create>[0]
  );

  return {
    id: link.id,
    short_url: link.short_url,
    status: link.status,
  };
}
