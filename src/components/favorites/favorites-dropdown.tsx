"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { FavoriteCreatorItem } from "./favorite-creator-item";
import { useFavorites } from "@/hooks/use-favorites";
import { useTranslation } from "@/i18n";

export function FavoritesDropdown() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { favorites } = useFavorites();

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const count = favorites.length;
  const displayFavorites = favorites.slice(0, 10);

  return (
    <div ref={ref} className="relative">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger
            onClick={() => setOpen(!open)}
            className="cursor-pointer rounded-full p-1.5 text-muted-foreground transition-colors hover:text-foreground"
            aria-label={t("favorites.title")}
          >
            <Heart className="size-5" />
          </TooltipTrigger>
          {!open && <TooltipContent>{t("favorites.title")}</TooltipContent>}
        </Tooltip>
      </TooltipProvider>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border bg-popover shadow-lg">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h3 className="text-sm font-semibold">{t("favorites.title")}</h3>
            <span className="text-xs text-muted-foreground">
              {count} {t("favorites.saved")}
            </span>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {displayFavorites.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Heart className="mx-auto mb-2 size-6 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {t("favorites.empty")}
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {displayFavorites.map((creator) => (
                  <FavoriteCreatorItem
                    key={creator.id}
                    creator={creator}
                    onClose={() => setOpen(false)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {count > 10 && (
            <div className="border-t px-4 py-2 text-center">
              <Link
                href="/brand/dashboard#favorites"
                onClick={() => setOpen(false)}
                className="text-xs font-medium text-primary hover:underline"
              >
                {t("favorites.viewAll")}
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
