"use client";

import { useState, useRef, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageBubble } from "./message-bubble";
import { LoadingState } from "@/components/shared/loading-state";
import { useMessages } from "@/hooks/use-messages";
import { sendMessage } from "@/app/(app)/messages/actions";
import { useTranslation } from "@/i18n";
import { Send, Loader2 } from "lucide-react";

interface ChatViewProps {
  threadId: string;
}

export function ChatView({ threadId }: ChatViewProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { messages, otherUserName, otherUserAvatar, isLoading } =
    useMessages(threadId);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const initials = (otherUserName || "")
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  const handleSend = async () => {
    const body = text.trim();
    if (!body || sending) return;

    setSending(true);
    setText("");
    await sendMessage(threadId, body);
    await queryClient.invalidateQueries({ queryKey: ["messages", threadId] });
    queryClient.invalidateQueries({ queryKey: ["threads"] });
    queryClient.invalidateQueries({ queryKey: ["unread-count"] });
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (isLoading) {
    return <LoadingState variant="page" />;
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Chat header */}
      <div className="shrink-0 border-b">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          {(otherUserAvatar || initials.length > 0) && (
            <Avatar className="size-9">
              {otherUserAvatar ? (
                <AvatarImage src={otherUserAvatar} alt={otherUserName || ""} />
              ) : null}
              {initials.length > 0 && (
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              )}
            </Avatar>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{otherUserName}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto"
      >
        <div className="mx-auto max-w-3xl space-y-3 px-4 py-4">
          {messages.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              {t("messages.noMessages")}
            </p>
          ) : (
            messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                body={msg.body}
                timestamp={msg.createdAt}
                isOwn={msg.isOwn}
              />
            ))
          )}
        </div>
      </div>

      {/* Send input */}
      <div className="shrink-0 border-t bg-background">
        <div className="mx-auto flex max-w-3xl gap-2 px-4 py-3">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("messages.placeholder")}
            disabled={sending}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={!text.trim() || sending}
            size="icon"
          >
            {sending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
