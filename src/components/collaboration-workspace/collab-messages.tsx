"use client";

import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { sendCollabMessage } from "@/app/(app)/collaboration-workspace/actions";
import type { CollabMessageItem } from "@/app/(app)/collaboration-workspace/actions";
import { Send, Loader2, MessageCircle, Activity, Info } from "lucide-react";

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

// ─── Activity Log ──────────────────────────────────────────────────────────

interface ActivityLogProps {
  messages: CollabMessageItem[];
  onActionClick?: (actionType: string) => void;
}

export function ActivityLog({ messages, onActionClick }: ActivityLogProps) {
  const events = messages.filter((m) => m.isSystemEvent);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="size-4" />
          Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-0">
        {events.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No activity yet
          </p>
        ) : (
          <div className="relative">
            {events.map((event, i) => (
              <div key={event.id} className="relative flex gap-3 pb-4 last:pb-0">
                {/* Vertical line */}
                {i < events.length - 1 && (
                  <div className="absolute left-[7px] top-5 bottom-0 w-px bg-border" />
                )}
                {/* Dot */}
                <div className="relative mt-1.5 size-[15px] shrink-0 rounded-full border-2 border-primary bg-background" />
                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-sm text-foreground">
                      {event.body}
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatTime(event.createdAt)}
                    </span>
                  </div>
                  {event.actionType && event.actionLabel && onActionClick && (
                    <Button
                      variant="link"
                      size="sm"
                      className="mt-0.5 h-auto cursor-pointer p-0 text-xs"
                      onClick={() => onActionClick(event.actionType!)}
                    >
                      {event.actionLabel}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Messages ──────────────────────────────────────────────────────────────

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
  const userMessages = messages.filter((m) => !m.isSystemEvent);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [userMessages.length]);

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
          Messages
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex h-[400px] flex-col">
          {/* Messages area */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto">
            <div className="space-y-3 px-5 py-4">
              {userMessages.length === 0 ? (
                <p className="py-12 text-center text-sm text-muted-foreground">
                  No messages yet
                </p>
              ) : (
                userMessages.map((msg) => {
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
