"use client";

import { useState } from "react";
import { ConversationList } from "./components/ConversationList";
import { ConversationThread } from "./components/ConversationThread";
import { ContactPanel } from "./components/ContactPanel";

export default function InboxPage() {
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [activeContactId, setActiveContactId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<
    "list" | "thread" | "contact"
  >("list");

  function handleSelectConversation(convoId: string, contactId: string) {
    setActiveConversationId(convoId);
    setActiveContactId(contactId);
    setMobileView("thread");
  }

  return (
    <div className="flex h-full">
      {/* Left: Conversation list */}
      <div
        className={`w-full flex-shrink-0 md:block md:w-80 ${mobileView !== "list" ? "hidden" : ""}`}
      >
        <ConversationList
          activeId={activeConversationId}
          onSelect={handleSelectConversation}
        />
      </div>

      {/* Middle: Thread */}
      <div
        className={`flex flex-1 flex-col md:flex ${mobileView !== "thread" ? "hidden md:flex" : ""}`}
      >
        <ConversationThread
          conversationId={activeConversationId}
          onBack={() => setMobileView("list")}
          onShowContact={() => setMobileView("contact")}
        />
      </div>

      {/* Right: Contact panel */}
      <div
        className={`w-full flex-shrink-0 md:block md:w-80 lg:w-[340px] ${mobileView !== "contact" ? "hidden md:hidden lg:block" : ""}`}
      >
        <ContactPanel
          contactId={activeContactId}
          conversationId={activeConversationId}
          onBack={() => setMobileView("thread")}
        />
      </div>
    </div>
  );
}
