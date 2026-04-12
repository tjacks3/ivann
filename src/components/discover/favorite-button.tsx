"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { useToggleFavorite } from "@/hooks/use-favorites";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  creatorId: string;
  isFavorited: boolean;
}

export function FavoriteButton({ creatorId, isFavorited: initialFavorited }: FavoriteButtonProps) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [animating, setAnimating] = useState(false);
  const toggle = useToggleFavorite();

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const prev = favorited;
    setFavorited(!prev);
    setAnimating(true);
    setTimeout(() => setAnimating(false), 300);

    const result = await toggle(creatorId);
    if (!result.success) {
      setFavorited(prev);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "flex size-8 cursor-pointer items-center justify-center rounded-full transition-all hover:scale-110",
        favorited
          ? "bg-red-500/10 text-red-500"
          : "bg-background/80 text-muted-foreground hover:text-red-500",
        animating && "scale-125",
      )}
      aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart
        className={cn("size-4 transition-all", favorited && "fill-current")}
      />
    </button>
  );
}
