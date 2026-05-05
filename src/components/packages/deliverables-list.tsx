"use client";

import { Check } from "lucide-react";

function parseDeliverables(value: string): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.filter((s) => typeof s === "string" && s.trim());
  } catch {
    return value.split("\n").map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

interface DeliverablesListProps {
  value: string;
  limit?: number;
}

export function DeliverablesList({ value, limit }: DeliverablesListProps) {
  const items = parseDeliverables(value);
  if (items.length === 0) return null;

  const display = limit ? items.slice(0, limit) : items;
  const remaining = limit ? items.length - display.length : 0;

  return (
    <ul className="space-y-1">
      {display.map((item, i) => (
        <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
          <Check className="mt-0.5 size-3 shrink-0 text-primary" />
          <span className="break-words min-w-0">{item}</span>
        </li>
      ))}
      {remaining > 0 && (
        <li className="text-xs text-muted-foreground/60">
          +{remaining} more
        </li>
      )}
    </ul>
  );
}
