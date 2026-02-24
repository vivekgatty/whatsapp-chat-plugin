import { ConversationList } from "../components/ConversationList";
import { ConversationThread } from "../components/ConversationThread";
import { ContactPanel } from "../components/ContactPanel";

interface Props {
  params: Promise<{ conversationId: string }>;
}

export default async function ConversationDetailPage({ params }: Props) {
  const { conversationId } = await params;

  return (
    <div className="flex h-full">
      <ConversationList activeId={conversationId} />
      <ConversationThread conversationId={conversationId} />
      <ContactPanel conversationId={conversationId} />
    </div>
  );
}
