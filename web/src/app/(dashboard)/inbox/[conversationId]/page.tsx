"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { ConversationList } from "../components/ConversationList";
import { ConversationThread } from "../components/ConversationThread";
import { ContactPanel } from "../components/ContactPanel";

export default function ConversationDetailPage() {
  const params = useParams<{ conversationId: string }>();
  const [activeContactId, setActiveContactId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"list" | "thread" | "contact">("thread");

  return (
    <div className="flex h-full">
      <div
        className={`w-full flex-shrink-0 md:block md:w-80 ${mobileView !== "list" ? "hidden" : ""}`}
      >
        <ConversationList
          activeId={params.conversationId}
          onSelect={(_, contactId) => setActiveContactId(contactId)}
        />
      </div>

      <div
        className={`flex flex-1 flex-col md:flex ${mobileView !== "thread" ? "hidden md:flex" : ""}`}
      >
        <ConversationThread
          conversationId={params.conversationId}
          onBack={() => setMobileView("list")}
          onShowContact={() => setMobileView("contact")}
        />
      </div>

      <div
        className={`w-full flex-shrink-0 md:block md:w-80 lg:w-[340px] ${mobileView !== "contact" ? "hidden md:hidden lg:block" : ""}`}
      >
        <ContactPanel
          contactId={activeContactId}
          conversationId={params.conversationId}
          onBack={() => setMobileView("thread")}
        />
      </div>
    </div>
  );
}
