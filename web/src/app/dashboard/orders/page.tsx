import FeatureGateCard from "@/components/FeatureGateCard";

export default function OrdersPage() {
  return (
    <FeatureGateCard feature="ORDERS" title="Orders">
      <section className="px-2 py-3 text-sm">Orders (mobile ready)</section>
    </FeatureGateCard>
  );
}
