import AnalyticsButton from "./AnalyticsButton";

export default function TriggersTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AnalyticsButton />
      {children}
    </>
  );
}