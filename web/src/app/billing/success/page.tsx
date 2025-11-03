export default function BillingSuccess() {
  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="mb-2 text-2xl font-semibold text-emerald-400">Payment received 🎉</h1>
      <p className="text-zinc-300">
        Thanks! We’re processing your subscription. It usually activates within a minute.
      </p>
      <a className="mt-6 inline-block text-emerald-400 underline" href="/dashboard">
        Go to dashboard →
      </a>
    </main>
  );
}
