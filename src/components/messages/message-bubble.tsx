"use client";

import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  body: string;
  timestamp: Date;
  isOwn: boolean;
}

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MessageBubble({ body, timestamp, isOwn }: MessageBubbleProps) {
  return (
    <div
      className={cn("flex", isOwn ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-4 py-2.5",
          isOwn
            ? "rounded-br-md bg-primary text-primary-foreground"
            : "rounded-bl-md bg-muted text-foreground",
        )}
      >
        <p className="whitespace-pre-wrap text-sm">{body}</p>
        <p
          className={cn(
            "mt-1 text-[10px]",
            isOwn ? "text-primary-foreground/60" : "text-muted-foreground",
          )}
        >
          {formatTime(timestamp)}
        </p>
      </div>
    </div>
  );
}
