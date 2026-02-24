import type { Message } from "@/types";

interface Props {
  message: Message;
}

function statusIcon(status: string, direction: string) {
  if (direction !== "outbound") return null;
  switch (status) {
    case "sent":
      return <span className="text-gray-300">✓</span>;
    case "delivered":
      return <span className="text-gray-300">✓✓</span>;
    case "read":
      return <span className="text-blue-400">✓✓</span>;
    case "failed":
      return <span className="text-red-400">✕</span>;
    default:
      return <span className="text-gray-300">⏳</span>;
  }
}

export function MessageBubble({ message }: Props) {
  const isOutbound = message.direction === "outbound";
  const isNote = message.is_internal_note;
  const time = new Date(message.created_at).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  // System messages
  if (message.message_type === "system") {
    return (
      <div className="flex justify-center py-1">
        <span className="rounded-lg bg-white/70 px-3 py-1 text-xs text-gray-500">
          {message.content}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex ${isOutbound ? "justify-end" : "justify-start"}`}>
      <div
        className={`relative max-w-[75%] rounded-2xl px-3.5 py-2 shadow-sm ${
          isNote
            ? "border border-yellow-200 bg-yellow-50 text-yellow-900"
            : isOutbound
              ? "rounded-br-md bg-[#dcf8c6] text-gray-900"
              : "rounded-bl-md bg-white text-gray-900"
        }`}
      >
        {isNote && (
          <div className="mb-1 flex items-center gap-1 text-xs font-medium text-yellow-600">
            🔒 Internal note
          </div>
        )}

        {message.message_type === "template" && (
          <div className="mb-1">
            <span className="rounded bg-green-100 px-1.5 py-0.5 text-xs font-medium text-green-700">
              Template
            </span>
          </div>
        )}

        {/* Text content */}
        {(message.message_type === "text" || message.content) && (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        )}

        {/* Image */}
        {message.message_type === "image" && message.media_url && (
          <div className="mb-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={message.media_url}
              alt={message.caption ?? "Image"}
              className="max-h-60 rounded-lg"
            />
            {message.caption && <p className="mt-1 text-sm">{message.caption}</p>}
          </div>
        )}

        {/* Document */}
        {message.message_type === "document" && (
          <a
            href={message.media_url ?? "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-sm text-blue-600 hover:bg-gray-200"
          >
            📎 {message.media_filename ?? "Document"}
          </a>
        )}

        {/* Location */}
        {message.message_type === "location" && (
          <div className="text-sm">
            📍 {message.location_name ?? `${message.latitude}, ${message.longitude}`}
            {message.location_address && (
              <p className="text-xs text-gray-500">{message.location_address}</p>
            )}
          </div>
        )}

        {/* Audio / Video / Sticker placeholder */}
        {(message.message_type === "audio" ||
          message.message_type === "video" ||
          message.message_type === "sticker") && (
          <p className="text-sm text-gray-500 italic">[{message.message_type}]</p>
        )}

        {/* Reaction */}
        {message.message_type === "reaction" && message.reaction_emoji && (
          <p className="text-2xl">{message.reaction_emoji}</p>
        )}

        {/* Timestamp + status */}
        <div
          className={`mt-1 flex items-center justify-end gap-1 text-xs ${
            isNote ? "text-yellow-500" : "text-gray-400"
          }`}
        >
          <span>{time}</span>
          {statusIcon(message.status, message.direction)}
        </div>

        {/* Error */}
        {message.error_message && (
          <p className="mt-1 text-xs text-red-500">⚠ {message.error_message}</p>
        )}
      </div>
    </div>
  );
}
