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

  const customer: Record<string, string> = {};
  if (input.customerName) customer.name = input.customerName;
  if (input.customerEmail) customer.email = input.customerEmail;
  if (input.customerPhone) customer.contact = input.customerPhone;

  const link = await razorpay.paymentLink.create({
    amount: input.amount,
    currency: input.currency,
    description: input.description,
    customer: Object.keys(customer).length > 0 ? customer : undefined,
    reference_id: input.orderId ?? undefined,
    callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/orders`,
    callback_method: "get",
  });

  return {
    id: link.id,
    short_url: link.short_url,
    status: link.status,
  };
}
