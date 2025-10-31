export const metadata = { title: "Privacy Policy | Chatmadi" };

export default function Page() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 prose prose-invert">
      <h1>Privacy Policy</h1>
      <p><strong>Last updated:</strong> {new Date().toISOString().slice(0,10)}</p>
      <p>
        Chatmadi ("we", "our", "us") respects your privacy. This policy explains what data we collect,
        how we use it, and your choices.
      </p>
      <h2>Information we collect</h2>
      <ul>
        <li>Account data (email) for authentication.</li>
        <li>Product usage events to provide core features and detect abuse.</li>
        <li>Payment metadata handled by our payment partner (Razorpay).</li>
      </ul>
      <h2>Use of information</h2>
      <ul>
        <li>To provide and improve Chatmadi services.</li>
        <li>To process payments and manage subscriptions.</li>
        <li>To communicate important product or billing updates.</li>
      </ul>
      <h2>Data sharing</h2>
      <p>
        We do not sell personal data. We share data with service providers strictly to operate the product
        (e.g., authentication, hosting, payments).
      </p>
      <h2>Contact</h2>
      <p>Email: <a href="mailto:admin@chatmadi.com">admin@chatmadi.com</a> &nbsp;|&nbsp; Phone: <a href="tel:+919591428002">+91 95914 28002</a></p>
    </div>
  );
}