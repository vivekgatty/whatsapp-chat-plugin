export const dynamic = "force-dynamic";
export const revalidate = 0;

import ClientPage from "./ClientPage";
import TriggersButton from "./TriggersButton";

export default function Page() {
  // Keep existing ClientPage layout untouched; just show a top-right link bar.
  return (
    <>
      <div className="mx-auto max-w-6xl p-4">
        <div className="flex items-center">
          <div className="ms-auto">
            <TriggersButton />
          </div>
        </div>
      </div>
      <ClientPage />
    </>
  );
}