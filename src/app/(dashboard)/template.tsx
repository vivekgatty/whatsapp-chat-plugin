import TriggerEventsBadge from "./TriggerEventsBadge";

export default function DashboardGroupTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <TriggerEventsBadge />
      {children}
    </>
  );
}