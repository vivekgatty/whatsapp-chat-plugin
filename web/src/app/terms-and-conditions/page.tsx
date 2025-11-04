import type { Metadata } from "next";
export const metadata: Metadata = { title: "Terms & Conditions â€” Chatmadi" };

export default function Page() {
  return (
    <div className="mx-auto max-w-4xl p-4 md:p-8 space-y-6">
      <h1 className="text-2xl font-semibold">Terms & Conditions</h1>
      <p><strong>Last updated:</strong> 04 Nov 2025</p>
      <p>These Terms govern your use of the Chatmadi service (â€œServiceâ€) provided by <strong>Eduloom Technologies OPC Pvt Ltd</strong> (â€œCompanyâ€, â€œweâ€, â€œusâ€). By using the Service, you agree to these Terms.</p>

      <h2 className="text-xl font-semibold mt-6">1) Accounts & Eligibility</h2>
      <p>You must be legally competent and, if acting for an entity, authorized to bind it. Youâ€™re responsible for your credentials and all activity on your account.</p>

      <h2 className="text-xl font-semibold mt-6">2) Subscriptions, Fees & Taxes</h2>
      <p>Paid features are subscription-based. Fees are billed in advance and non-refundable except as stated in <a className="underline" href="/cancellations-and-refunds">Cancellations & Refunds</a>. Prices/taxes may change; material changes will be notified in advance.</p>

      <h2 className="text-xl font-semibold mt-6">3) Cancellations</h2>
      <p>You may cancel anytime; access continues until the end of the current billing period.</p>

      <h2 className="text-xl font-semibold mt-6">4) Acceptable Use</h2>
      <ul className="list-disc ps-6 space-y-2">
        <li>No illegal, harmful, deceptive, or infringing activity.</li>
        <li>No security testing/scraping without written permission.</li>
        <li>No misuse of APIs or circumvention of quotas/limits.</li>
        <li>No unauthorized collection/processing of othersâ€™ personal data.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6">5) Your Content</h2>
      <p>You retain ownership. You grant us a limited license to host/process/display it to operate and improve the Service. You represent you have the required rights.</p>

      <h2 className="text-xl font-semibold mt-6">6) Third-Party Services</h2>
      <p>Some features rely on third parties (e.g., Razorpay). Their terms and privacy policies may apply.</p>

      <h2 className="text-xl font-semibold mt-6">7) Confidentiality & Privacy</h2>
      <p>Personal data is handled under our <a className="underline" href="/privacy-policy">Privacy Policy</a>.</p>

      <h2 className="text-xl font-semibold mt-6">8) Warranty Disclaimer</h2>
      <p>THE SERVICE IS PROVIDED â€œAS ISâ€ AND â€œAS AVAILABLEâ€ WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED.</p>

      <h2 className="text-xl font-semibold mt-6">9) Limitation of Liability</h2>
      <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE ARE NOT LIABLE FOR INDIRECT/INCIDENTAL/CONSEQUENTIAL DAMAGES. OUR TOTAL AGGREGATE LIABILITY WILL NOT EXCEED FEES PAID IN THE 12 MONTHS PRECEDING THE EVENT.</p>

      <h2 className="text-xl font-semibold mt-6">10) Indemnity</h2>
      <p>You will indemnify the Company and its affiliates for claims arising from your content, use of the Service, or breach of these Terms.</p>

      <h2 className="text-xl font-semibold mt-6">11) Suspension & Termination</h2>
      <p>We may suspend/terminate for violations or legal compliance. We may modify/discontinue features with reasonable notice for material changes.</p>

      <h2 className="text-xl font-semibold mt-6">12) Governing Law & Disputes</h2>
      <p>Indian law governs; exclusive jurisdiction lies with the courts in Bengaluru, Karnataka, subject to mandatory consumer laws.</p>

      <h2 className="text-xl font-semibold mt-6">13) Changes</h2>
      <p>We may update these Terms; continued use after the effective date is acceptance.</p>

      <h2 className="text-xl font-semibold mt-6">14) Contact</h2>
      <p>Eduloom Technologies OPC Pvt Ltd â€¢ Mysuru, Karnataka, India â€¢ <a className="underline" href="mailto:admin@chatmadi.com">admin@chatmadi.com</a></p>
    </div>
  );
}