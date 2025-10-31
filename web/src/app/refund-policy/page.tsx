export const metadata = { title: "Cancellations & Refunds | Chatmadi" };

export default function Page() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 prose prose-invert">
      <h1>Cancellations &amp; Refunds</h1>
      <p><strong>Last updated:</strong> {new Date().toISOString().slice(0,10)}</p>
      <h2>Subscription Cancellation</h2>
      <p>You can cancel anytime from your dashboard. Access remains until the end of the current billing period.</p>
      <h2>Refunds</h2>
      <p>
        If you believe you were charged in error, contact us within 7 days of the charge at
        <a href="mailto:admin@chatmadi.com"> admin@chatmadi.com</a>. Approved refunds are processed to the original payment method.
      </p>
      <h2>Contact</h2>
      <p>Email: <a href="mailto:admin@chatmadi.com">admin@chatmadi.com</a> &nbsp;|&nbsp; Phone: <a href="tel:+919591428002">+91 95914 28002</a></p>
    </div>
  );
}