export default function BillingSuccess() {
  return (
    <main className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-semibold text-emerald-400 mb-2">Payment received 🎉</h1>
      <p className="text-zinc-300">
        Thanks! We’re processing your subscription. It usually activates within a minute.
      </p>
      <a className="inline-block mt-6 underline text-emerald-400" href="/dashboard">
        Go to dashboard →
      </a>
    </main>
  );
}
