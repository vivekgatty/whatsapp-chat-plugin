import TriggerEventsBadge from "./TriggerEventsBadge";

export default function DashboardTemplate({
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