export const dynamic = "force-static";

export default function OverviewPage() {
  return (
    <section className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold">Overview</h1>
      <p className="mt-3 text-slate-300">
        This is the Overview tab. If your previous overview widgets/components need to be
        re-wired, we can import them here next—this page exists so the route is no longer 404.
      </p>
    </section>
  );
}
