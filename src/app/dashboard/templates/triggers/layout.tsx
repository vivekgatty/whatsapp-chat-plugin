import TriggerAnalyticsButton from "./TriggerAnalyticsButton";

export default function TriggersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <TriggerAnalyticsButton />
      {children}
    </>
  );
}