"use client";

import { useState, useRef, useCallback } from "react";
import { QuickReplyPicker } from "./QuickReplyPicker";
import { TemplatePicker } from "./TemplatePicker";

interface Props {
  conversationId: string;
}

export function MessageComposer({ conversationId }: Props) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [isNote, setIsNote] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(async () => {
    if (!text.trim() || sending) return;
    setSending(true);

    try {
      if (isNote) {
        // TODO: Insert internal note directly to messages table
      } else {
        await fetch("/api/whatsapp/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversationId, message: text }),
        });
      }
      setText("");
      setIsNote(false);
      inputRef.current?.focus();
    } finally {
      setSending(false);
    }
  }, [text, sending, isNote, conversationId]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleTextChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const v = e.target.value;
    setText(v);
    if (v.startsWith("/") && v.length > 1) {
      setShowQuickReplies(true);
    } else {
      setShowQuickReplies(false);
    }
  }

  return (
    <div className="relative border-t bg-white">
      {showQuickReplies && (
        <QuickReplyPicker
          query={text.slice(1)}
          onSelect={(content) => {
            setText(content);
            setShowQuickReplies(false);
            inputRef.current?.focus();
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

      {/* Internal note banner */}
      {isNote && (
        <div className="flex items-center gap-2 bg-yellow-50 px-4 py-1.5 text-xs text-yellow-700">
          🔒 Internal note — will NOT be sent to customer
        </div>
      )}

      <div className="flex items-end gap-2 p-3">
        {/* Toolbar */}
        <div className="flex gap-0.5">
          <button
            type="button"
            onClick={() => setIsNote(!isNote)}
            title={isNote ? "Switch to message" : "Write internal note"}
            className={`rounded-lg p-2 text-sm ${
              isNote
                ? "bg-yellow-100 text-yellow-700"
                : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            }`}
          >
            🔒
          </button>
          <button
            type="button"
            onClick={() => setShowTemplates(!showTemplates)}
            title="Templates"
            className="rounded-lg p-2 text-sm text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            📋
          </button>
          <button
            type="button"
            title="Attach file"
            className="rounded-lg p-2 text-sm text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            📎
          </button>
          <button
            type="button"
            title="Location"
            className="rounded-lg p-2 text-sm text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            📍
          </button>
        </div>

        {/* Text area */}
        <textarea
          ref={inputRef}
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder={
            isNote
              ? "Write an internal note…"
              : "Type a message… (/ for quick replies)"
          }
          rows={1}
          className={`flex-1 resize-none rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
            isNote
              ? "border-yellow-300 bg-yellow-50 focus:border-yellow-400 focus:ring-yellow-400"
              : "focus:border-green-500 focus:ring-green-500"
          }`}
          style={{ maxHeight: "120px" }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = "auto";
            target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
          }}
        />

        {/* Send */}
        <button
          onClick={handleSend}
          disabled={!text.trim() || sending}
          className={`rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50 ${
            isNote
              ? "bg-yellow-500 hover:bg-yellow-600"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {sending ? "…" : isNote ? "Note" : "Send"}
        </button>
      </div>

      <div className="px-4 pb-2 text-xs text-gray-400">
        Enter to send · Shift+Enter for newline
      </div>
    </div>
  );
}
