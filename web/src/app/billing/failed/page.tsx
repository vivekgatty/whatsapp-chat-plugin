export default function BillingFailed() {
  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="mb-2 text-2xl font-semibold text-red-400">Payment failed</h1>
      <p className="text-zinc-300">
        Your payment couldn’t be completed. You can try again or contact support.
      </p>
      <a className="mt-6 inline-block text-emerald-400 underline" href="/dashboard/billing">
        Try again →
      </a>
    </main>
  );
}
