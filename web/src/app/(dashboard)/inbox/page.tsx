import { ConversationList } from "./components/ConversationList";
import { ConversationThread } from "./components/ConversationThread";
import { ContactPanel } from "./components/ContactPanel";

export default function InboxPage() {
  return (
    <div className="flex h-full">
      <ConversationList />
      <ConversationThread conversationId={null} />
      <ContactPanel contactId={null} />
    </div>
  );
}
