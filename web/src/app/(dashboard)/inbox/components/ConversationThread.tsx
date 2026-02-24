"use client";

import { MessageBubble } from "./MessageBubble";
import { MessageComposer } from "./MessageComposer";
import { EmptyState } from "@/components/shared/EmptyState";
import type { Message } from "@/types";

interface Props {
  conversationId: string | null;
}

export function ConversationThread({ conversationId }: Props) {
  // TODO: Fetch messages with Supabase Realtime subscription
  const messages: Message[] = [];

  if (!conversationId) {
    return (
      <div className="flex flex-1 items-center justify-center bg-gray-50">
        <EmptyState
          title="Select a conversation"
          description="Choose a conversation from the left to start messaging."
        />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
        </div>
      </div>
      <MessageComposer conversationId={conversationId} />
    </div>
  );
}
