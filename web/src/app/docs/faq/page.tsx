export default function Page() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">FAQ</h1>

      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-medium">Where do I find my Widget ID?</h2>
          <p className="text-slate-300">Dashboard → Widget settings (it also appears in the embed snippet box).</p>
        </div>

        <div>
          <h2 className="text-lg font-medium">How do languages work?</h2>
          <p className="text-slate-300">
            We match on the requested locale; if not found we fall back to English defaults.
            You can create per-locale templates under <strong>Templates</strong>.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-medium">What about off-hours?</h2>
          <p className="text-slate-300">
            If your hours indicate “closed” at a given time, <code>off_hours</code> messages are selected.
            Use <strong>Languages</strong> and <strong>Business hours</strong> pages to configure inputs and test via the QA page.
          </p>
        </div>
      </div>
    </div>
  );
}
