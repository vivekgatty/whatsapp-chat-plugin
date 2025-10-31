export const metadata = { title: "Terms & Conditions | Chatmadi" };

export default function Page() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 prose prose-invert">
      <h1>Terms &amp; Conditions</h1>
      <p><strong>Last updated:</strong> {new Date().toISOString().slice(0,10)}</p>
      <h2>Accounts</h2>
      <p>You are responsible for activity on your account and for keeping credentials secure.</p>
      <h2>Subscriptions & Billing</h2>
      <ul>
        <li>Plans are prepaid and auto-renew until cancelled.</li>
        <li>Taxes may apply as per law.</li>
      </ul>
      <h2>Acceptable Use</h2>
      <p>No spam, abuse, or illegal content. We may suspend accounts violating these terms.</p>
      <h2>Limitation of Liability</h2>
      <p>Service is provided “as is”. To the extent permitted by law, our liability is limited to amounts paid in the last 6 months.</p>
      <h2>Contact</h2>
      <p>Email: <a href="mailto:admin@chatmadi.com">admin@chatmadi.com</a> &nbsp;|&nbsp; Phone: <a href="tel:+919591428002">+91 95914 28002</a></p>
    </div>
  );
}