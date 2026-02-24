import type { Message } from "@/types";

interface Props {
  message: Message;
}

export function MessageBubble({ message }: Props) {
  const isOutbound = message.direction === "outbound";
  const isNote = message.is_internal_note;

  return (
    <div className={`flex ${isOutbound ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
          isNote
            ? "border border-yellow-200 bg-yellow-50 text-yellow-900"
            : isOutbound
              ? "bg-green-600 text-white"
              : "bg-white text-gray-900 shadow-sm"
        }`}
      >
        {isNote && <p className="mb-1 text-xs font-medium text-yellow-600">Internal note</p>}

        {message.message_type === "text" && <p className="text-sm">{message.content}</p>}

        {message.message_type === "image" && (
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={message.media_url ?? ""}
              alt={message.caption ?? "Image"}
              className="max-h-60 rounded-lg"
            />
            {message.caption && <p className="mt-1 text-sm">{message.caption}</p>}
          </div>
        )}

        {message.message_type === "document" && (
          <a
            href={message.media_url ?? "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm underline"
          >
            📎 {message.media_filename ?? "Document"}
          </a>
        )}

        {message.message_type === "location" && (
          <p className="text-sm">
            📍 {message.location_name ?? `${message.latitude}, ${message.longitude}`}
          </p>
        )}

        <p className={`mt-1 text-right text-xs ${isOutbound ? "text-green-200" : "text-gray-400"}`}>
          {new Date(message.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
          {isOutbound && message.status === "read" && " ✓✓"}
          {isOutbound && message.status === "delivered" && " ✓✓"}
          {isOutbound && message.status === "sent" && " ✓"}
        </p>
      </div>
    </div>
  );
}
