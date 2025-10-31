export const metadata = { title: "Contact Us | Chatmadi" };

export default function Page() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 prose prose-invert">
      <h1>Contact Us</h1>
      <p>We usually respond within 1–2 business days.</p>
      <ul>
        <li>Email: <a href="mailto:admin@chatmadi.com">admin@chatmadi.com</a></li>
        <li>Phone/WhatsApp: <a href="tel:+919591428002">+91 95914 28002</a></li>
      </ul>
    </div>
  );
}