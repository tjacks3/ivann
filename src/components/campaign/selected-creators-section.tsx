"use client";

import { useState, useEffect, useMemo } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Users, Send } from "lucide-react";

interface CreatorItem {
  id: string;
  creatorId: string;
  fullName: string | null;
  username: string | null;
  avatarUrl: string | null;
}

interface SelectedCreatorsSectionProps {
  creators: CreatorItem[];
  onCreateOffers: (creatorIds: string[]) => void;
}

export function SelectedCreatorsSection({
  creators,
  onCreateOffers,
}: SelectedCreatorsSectionProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Prune stale selections when the creators list changes (e.g. after deals are sent)
  const validCreatorIds = useMemo(
    () => new Set(creators.map((c) => c.creatorId)),
    [creators],
  );
  useEffect(() => {
    setSelectedIds((prev) => {
      const pruned = new Set([...prev].filter((id) => validCreatorIds.has(id)));
      return pruned.size === prev.size ? prev : pruned;
    });
  }, [validCreatorIds]);

  if (creators.length === 0) return null;

  const allSelected =
    creators.length > 0 && selectedIds.size === creators.length;

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(creators.map((c) => c.creatorId)));
    }
  };

  const toggle = (creatorId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(creatorId)) {
        next.delete(creatorId);
      } else {
        next.add(creatorId);
      }
      return next;
    });
  };

  const selectedCount = selectedIds.size;

  return (
    <div className="rounded-xl border">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-5 py-3">
        <div className="flex items-center gap-2">
          <Users className="size-4 text-primary" />
          <span className="text-sm font-semibold">
            {creators.length} creator{creators.length !== 1 ? "s" : ""} added
            &mdash; not yet invited
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Select creators to create and send individual deals
        </p>
      </div>

      {/* Select all toggle */}
      <div className="border-b px-5 py-2">
        <label className="flex cursor-pointer items-center gap-2.5 text-sm">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={toggleAll}
            className="size-4 cursor-pointer rounded border-input accent-primary"
          />
          <span className="text-muted-foreground">
            {allSelected ? "Deselect all" : "Select all"}
          </span>
        </label>
      </div>

      {/* Creator list */}
      <div className="divide-y">
        {creators.map((creator) => {
          const isSelected = selectedIds.has(creator.creatorId);
          const initials = (creator.fullName ?? "?")
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);

          return (
            <label
              key={creator.creatorId}
              className={`flex cursor-pointer items-center gap-3.5 px-5 py-3 transition-colors ${
                isSelected
                  ? "bg-primary/5"
                  : "hover:bg-muted/50"
              }`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggle(creator.creatorId)}
                className="size-4 shrink-0 cursor-pointer rounded border-input accent-primary"
              />
              <Avatar className="size-9 shrink-0">
                {creator.avatarUrl && (
                  <AvatarImage src={creator.avatarUrl} alt={creator.fullName ?? ""} />
                )}
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {creator.fullName ?? "Creator"}
                </p>
                {creator.username && (
                  <p className="truncate text-xs text-muted-foreground">
                    @{creator.username}
                  </p>
                )}
              </div>
            </label>
          );
        })}
      </div>

      {/* CTA */}
      <div className="border-t px-5 py-4">
        <Button
          className="w-full cursor-pointer"
          disabled={selectedCount === 0}
          onClick={() => onCreateOffers(Array.from(selectedIds))}
        >
          <Send className="size-3.5" />
          {selectedCount === 0
            ? "Create Offer(s)"
            : selectedCount === 1
              ? "Create Offer (1)"
              : `Create Offers (${selectedCount})`}
        </Button>
      </div>
    </div>
  );
}
