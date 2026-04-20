"use client";

import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { sendCollabMessage } from "@/app/(app)/collaboration-workspace/actions";
import type { CollabMessageItem } from "@/app/(app)/collaboration-workspace/actions";
import { Send, Loader2, MessageCircle, Info } from "lucide-react";

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getInitials(name: string | null): string {
  return (name || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface CollabMessagesProps {
  collaborationId: string;
  messages: CollabMessageItem[];
  currentUserId: string;
  onMessageSent: () => void;
}

export function CollabMessages({
  collaborationId,
  messages,
  currentUserId,
  onMessageSent,
}: CollabMessagesProps) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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
    await sendCollabMessage(collaborationId, body);
    onMessageSent();
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card>
      <CardHeader className="pb-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageCircle className="size-4" />
          Activity &amp; Messages
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex h-[400px] flex-col">
          {/* Messages area */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto">
            <div className="space-y-3 px-5 py-4">
              {messages.length === 0 ? (
                <p className="py-12 text-center text-sm text-muted-foreground">
                  No messages yet
                </p>
              ) : (
                messages.map((msg) => {
                  if (msg.isSystemEvent) {
                    return (
                      <div
                        key={msg.id}
                        className="flex items-center justify-center gap-1.5 py-1"
                      >
                        <Info className="size-3 text-muted-foreground" />
                        <span className="text-xs italic text-muted-foreground">
                          {msg.body}
                        </span>
                        <span className="text-[10px] text-muted-foreground/60">
                          {formatTime(msg.createdAt)}
                        </span>
                      </div>
                    );
                  }

                  const isOwn = msg.senderId === currentUserId;

                  return (
                    <div
                      key={msg.id}
                      className={cn("flex gap-2", isOwn ? "justify-end" : "justify-start")}
                    >
                      {!isOwn && (
                        <Avatar className="size-7 shrink-0">
                          {msg.senderAvatar && (
                            <AvatarImage
                              src={msg.senderAvatar}
                              alt={msg.senderName || ""}
                            />
                          )}
                          <AvatarFallback className="text-[10px]">
                            {getInitials(msg.senderName)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={cn(
                          "max-w-[75%] rounded-2xl px-4 py-2.5",
                          isOwn
                            ? "rounded-br-md bg-primary text-primary-foreground"
                            : "rounded-bl-md bg-muted text-foreground",
                        )}
                      >
                        {!isOwn && msg.senderName && (
                          <p className="mb-0.5 text-[10px] font-medium opacity-70">
                            {msg.senderName}
                          </p>
                        )}
                        <p className="whitespace-pre-wrap text-sm">{msg.body}</p>
                        <p
                          className={cn(
                            "mt-1 text-[10px]",
                            isOwn
                              ? "text-primary-foreground/60"
                              : "text-muted-foreground",
                          )}
                        >
                          {formatTime(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Input */}
          <div className="shrink-0 border-t bg-background">
            <div className="flex gap-2 px-5 py-3">
              <Input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
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
      </CardContent>
    </Card>
  );
}
