import type { Metadata } from "next";
export const metadata: Metadata = { title: "Cancellations & Refunds — Chatmadi" };

export default function Page() {
  return (
    <div className="mx-auto max-w-4xl p-4 md:p-8 space-y-6">
      <h1 className="text-2xl font-semibold">Cancellations & Refunds</h1>
      <p><strong>Last updated:</strong> 04 Nov 2025</p>

      <h2 className="text-xl font-semibold mt-6">1) Cancelling Your Subscription</h2>
      <p>Cancel anytime from the Billing page or by emailing support. Access remains until the end of the current period.</p>

      <h2 className="text-xl font-semibold mt-6">2) Refund Eligibility</h2>
      <ul className="list-disc ps-6 space-y-2">
        <li><strong>Duplicate/accidental charges</strong>: fully refundable.</li>
        <li><strong>Billing errors</strong>: fully refundable.</li>
        <li><strong>First-time purchase issue</strong>: if a technical problem prevents meaningful use and you contact us within 7 days, we’ll resolve or refund in good faith.</li>
        <li>Otherwise, subscriptions are prepaid and <strong>non-refundable</strong>; no prorated refunds.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6">3) Refund Method</h2>
      <p>Approved refunds are issued to the original payment method via Razorpay. Bank/card timelines typically 5–10 business days after approval.</p>

      <h2 className="text-xl font-semibold mt-6">4) Chargebacks</h2>
      <p>Please contact us to resolve billing issues first. Unfounded chargebacks may result in suspension.</p>

      <h2 className="text-xl font-semibold mt-6">5) Contact</h2>
      <p>Email <a className="underline" href="mailto:support@chatmadi.com">support@chatmadi.com</a> with your account email, payment reference, and details.</p>
    </div>
  );
}