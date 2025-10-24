import { NextResponse } from "next/server";
import { getRazorpay } from '../../../../lib/razorpay';

type Body = {
  amount: number;        // INR (e.g. 499)
  receipt?: string;      // optional receipt id
  notes?: Record<string, string>;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body | null;
    const amountInINR = Number(body?.amount ?? 0);
    if (!amountInINR || amountInINR <= 0) {
      return NextResponse.json({ ok: false, error: "Invalid amount" }, { status: 400 });
    }

    const razorpay = getRazorpay();
    const order = await razorpay.orders.create({
      amount: Math.round(amountInINR * 100), // paise
      currency: "INR",
      receipt: body?.receipt ?? `rcpt_${Date.now()}`,
      notes: body?.notes ?? {},
    });

    return NextResponse.json({ ok: true, order });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? "Order create failed" }, { status: 500 });
  }
}
