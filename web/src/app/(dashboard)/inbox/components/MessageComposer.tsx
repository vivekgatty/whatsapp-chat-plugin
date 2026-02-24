"use client";

import { useState, useRef } from "react";
import { QuickReplyPicker } from "./QuickReplyPicker";
import { TemplatePicker } from "./TemplatePicker";

interface Props {
  conversationId: string;
}

export function MessageComposer({ conversationId }: Props) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  async function handleSend() {
    if (!text.trim() || sending) return;
    setSending(true);

    try {
      await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, message: text }),
      });
      setText("");
      inputRef.current?.focus();
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (text.startsWith("/") && text.length > 1) {
      setShowQuickReplies(true);
    } else {
      setShowQuickReplies(false);
    }
  }

  return (
    <div className="relative border-t bg-white p-4">
      {showQuickReplies && (
        <QuickReplyPicker
          query={text.slice(1)}
          onSelect={(content) => {
            setText(content);
            setShowQuickReplies(false);
          }}
          onClose={() => setShowQuickReplies(false)}
        />
      )}
      {showTemplates && (
        <TemplatePicker
          onSelect={(templateName) => {
            setText(`[Template: ${templateName}]`);
            setShowTemplates(false);
          }}
          onClose={() => setShowTemplates(false)}
        />
      )}

      <div className="flex items-end gap-2">
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setShowTemplates(!showTemplates)}
            title="Templates"
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            📋
          </button>
          <button
            type="button"
            title="Attach file"
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            📎
          </button>
        </div>
        <textarea
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message… (/ for quick replies)"
          rows={1}
          className="flex-1 resize-none rounded-lg border px-4 py-2.5 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || sending}
          className="rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}
