"use client";

import { useRouter } from "next/navigation";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Heart } from "lucide-react";
import { useToggleFavorite } from "@/hooks/use-favorites";
import type { FavoriteCreator } from "@/app/(app)/favorites/actions";

interface FavoriteCreatorItemProps {
  creator: FavoriteCreator;
  onClose: () => void;
}

export function FavoriteCreatorItem({ creator, onClose }: FavoriteCreatorItemProps) {
  const router = useRouter();
  const toggle = useToggleFavorite();

  const initials = (creator.fullName || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleClick = () => {
    onClose();
    router.push(`/creator/${creator.username}`);
  };

  const handleRemove = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await toggle(creator.id);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleClick(); }}
      className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50"
    >
      <Avatar className="size-8 shrink-0">
        {creator.avatarUrl && (
          <AvatarImage src={creator.avatarUrl} alt={creator.fullName || ""} />
        )}
        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium">{creator.fullName}</p>
        <p className="truncate text-xs text-muted-foreground">@{creator.username}</p>
      </div>
      <button
        type="button"
        onClick={handleRemove}
        className="shrink-0 cursor-pointer rounded-full p-1 text-red-500/60 transition-colors hover:bg-red-500/10 hover:text-red-500"
        aria-label="Remove from favorites"
      >
        <Heart className="size-3.5 fill-current" />
      </button>
    </div>
  );
}
