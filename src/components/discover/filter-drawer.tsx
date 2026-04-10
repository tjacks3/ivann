"use client";

import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetClose,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { DiscoverFiltersPanel } from "./discover-filters";
import { SlidersHorizontal, X } from "lucide-react";
import { useTranslation } from "@/i18n";
import type { DiscoverFilters } from "@/lib/validations/discover";

interface FilterDrawerProps {
  filters: DiscoverFilters;
  onUpdate: (updates: Partial<DiscoverFilters>) => void;
  onClear: () => void;
  activeCount: number;
}

export function FilterDrawer({
  filters,
  onUpdate,
  onClear,
  activeCount,
}: FilterDrawerProps) {
  const { t } = useTranslation();

  return (
    <Sheet>
      <SheetTrigger
        className="inline-flex items-center gap-1.5 rounded-full border border-input bg-background px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
      >
        <SlidersHorizontal className="size-3.5" />
        {t("discover.filters")}
        {activeCount > 0 && (
          <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
            {activeCount}
          </span>
        )}
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0" showCloseButton={false}>
        <div className="flex h-14 items-center justify-between border-b px-4">
          <SheetTitle className="text-base font-bold">
            {t("discover.filters")}
          </SheetTitle>
          <SheetClose>
            <X className="size-5" />
          </SheetClose>
        </div>
        <div className="overflow-y-auto p-4">
          <DiscoverFiltersPanel
            filters={filters}
            onUpdate={onUpdate}
            onClear={onClear}
            activeCount={activeCount}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
