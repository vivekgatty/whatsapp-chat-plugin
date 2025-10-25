export default function BillingFailed() {
  return (
    <main className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-semibold text-red-400 mb-2">Payment failed</h1>
      <p className="text-zinc-300">
        Your payment couldn’t be completed. You can try again or contact support.
      </p>
      <a className="inline-block mt-6 underline text-emerald-400" href="/dashboard/billing">
        Try again →
      </a>
    </main>
  );
}
