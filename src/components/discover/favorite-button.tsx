"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { useToggleFavorite } from "@/hooks/use-favorites";
import { useTranslation } from "@/i18n";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  creatorId: string;
  isFavorited: boolean;
}

export function FavoriteButton({ creatorId, isFavorited: initialFavorited }: FavoriteButtonProps) {
  const { t } = useTranslation();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [animating, setAnimating] = useState(false);
  const toggle = useToggleFavorite();

  // Sync with prop when it changes (e.g., after cache refresh)
  useEffect(() => {
    setFavorited(initialFavorited);
  }, [initialFavorited]);

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

  const label = favorited ? t("favorites.removeFromFavorites") : t("favorites.addToFavorites");

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          className={cn(
            "flex size-8 cursor-pointer items-center justify-center rounded-full transition-all hover:scale-110",
            favorited
              ? "bg-red-500/10 text-red-500"
              : "bg-background/80 text-muted-foreground hover:text-red-500",
            animating && "scale-125",
          )}
          onClick={handleClick}
          aria-label={label}
        >
          <Heart
            className={cn("size-4 transition-all", favorited && "fill-current")}
          />
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
