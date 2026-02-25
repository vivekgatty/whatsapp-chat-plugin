import FeatureGateCard from "@/components/FeatureGateCard";

export default function BroadcastsPage() {
  return (
    <FeatureGateCard feature="BROADCASTS" title="Broadcasts">
      <section className="px-2 py-3 text-sm">Broadcasts (mobile ready)</section>
    </FeatureGateCard>
  );
}
