import type { Metadata } from "next";
export const metadata: Metadata = { title: "Privacy Policy â€” Chatmadi" };

export default function Page() {
  return (
    <div className="mx-auto max-w-4xl p-4 md:p-8 space-y-6">
      <h1 className="text-2xl font-semibold">Privacy Policy</h1>
      <p><strong>Last updated:</strong> 04 Nov 2025</p>
      <p>
        This Privacy Policy explains how <strong>Eduloom Technologies OPC Pvt Ltd</strong>
        (â€œweâ€, â€œusâ€, â€œourâ€) collects, uses, and protects personal information in
        connection with the Chatmadi service (â€œServiceâ€). By using the Service, you agree to this Policy.
      </p>

      <h2 className="text-xl font-semibold mt-6">1) Information We Collect</h2>
      <ul className="list-disc ps-6 space-y-2">
        <li><strong>Account data</strong>: name, email, phone, company profile you provide.</li>
        <li><strong>Transactional data</strong>: subscription status, invoices, and payment confirmations (via Razorpay; we do not store full card details).</li>
        <li><strong>Product & analytics data</strong>: widget events, usage metrics, IP/user-agent and logs for security and operations.</li>
        <li><strong>Communications</strong>: messages you send us (support, feedback).</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6">2) How We Use Information</h2>
      <ul className="list-disc ps-6 space-y-2">
        <li>Provide, operate, and improve the Service and widgets.</li>
        <li>Authenticate users and prevent fraud/abuse.</li>
        <li>Process payments and manage subscriptions.</li>
        <li>Provide support and send important account notices.</li>
        <li>Comply with legal obligations and enforce Terms.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6">3) Legal Bases</h2>
      <p>We process data to perform our contract, comply with law, and for legitimate interests (e.g., security, product improvement). Where required, we obtain consent.</p>

      <h2 className="text-xl font-semibold mt-6">4) Sharing</h2>
      <p>We share with trusted sub-processors (hosting, DB, logging, analytics, email, payments) solely to deliver the Service, under confidentiality and security obligations. We do not sell personal data.</p>

      <h2 className="text-xl font-semibold mt-6">5) Data Security</h2>
      <p>We use appropriate technical and organizational safeguards. No method is 100% secure; residual risk remains.</p>

      <h2 className="text-xl font-semibold mt-6">6) Data Retention</h2>
      <p>We retain data as needed for these purposes, legal/financial recordkeeping, dispute resolution, and enforcement; then delete or anonymize.</p>

      <h2 className="text-xl font-semibold mt-6">7) Your Rights</h2>
      <p>Subject to law, you may request access, correction, deletion, portability, or restriction. We respond within a reasonable time.</p>

      <h2 className="text-xl font-semibold mt-6">8) International Transfers</h2>
      <p>Data may be processed outside your country with appropriate safeguards where required.</p>

      <h2 className="text-xl font-semibold mt-6">9) Children</h2>
      <p>The Service is not directed to children under 16.</p>

      <h2 className="text-xl font-semibold mt-6">10) Changes</h2>
      <p>We may update this Policy and will post the effective date; material changes may include additional notice.</p>

      <h2 className="text-xl font-semibold mt-6">11) Contact</h2>
      <p>Eduloom Technologies OPC Pvt Ltd, Mysuru, Karnataka, India â€¢ Email: <a className="underline" href="mailto:admin@chatmadi.com">admin@chatmadi.com</a></p>
    </div>
  );
}