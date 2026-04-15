"use client";

import { cn } from "@/lib/utils";

interface RichTextDisplayProps {
  content: string | null;
  fallback?: string;
  className?: string;
}

export function RichTextDisplay({ content, fallback, className }: RichTextDisplayProps) {
  if (!content) {
    return fallback ? <span className="text-muted-foreground">{fallback}</span> : null;
  }

  return (
    <div
      dangerouslySetInnerHTML={{ __html: content }}
      className={cn(
        "text-sm [&_ul]:ml-4 [&_ul]:list-disc [&_ol]:ml-4 [&_ol]:list-decimal [&_li]:mb-0.5 [&_b]:font-semibold [&_i]:italic",
        className,
      )}
    />
  );
}
