"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { CategorySelect } from "@/components/shared/category-select";
import { PLATFORM_ORDER, getPlatformMeta } from "@/lib/social/platforms";
import { useTranslation } from "@/i18n";
import { X } from "lucide-react";
import type { DiscoverFilters } from "@/lib/validations/discover";

interface DiscoverFiltersProps {
  filters: DiscoverFilters;
  onUpdate: (updates: Partial<DiscoverFilters>) => void;
  onClear: () => void;
  activeCount: number;
}

export function DiscoverFiltersPanel({
  filters,
  onUpdate,
  onClear,
  activeCount,
}: DiscoverFiltersProps) {
  const { t } = useTranslation();
  const [keyword, setKeyword] = useState(filters.keyword ?? "");

  // Debounce keyword search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (keyword !== (filters.keyword ?? "")) {
        onUpdate({ keyword: keyword || undefined });
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [keyword]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-5">
      {/* Keyword */}
      <div className="space-y-1.5">
        <Label className="text-xs">{t("discover.filter.keyword")}</Label>
        <Input
          placeholder={t("discover.searchPlaceholder")}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>

      {/* Categories */}
      <div className="space-y-1.5">
        <Label className="text-xs">{t("discover.filter.category")}</Label>
        <CategorySelect
          selected={filters.categories ?? []}
          onChange={(cats) => onUpdate({ categories: cats.length > 0 ? cats : undefined })}
        />
      </div>

      {/* Platform */}
      <div className="space-y-1.5">
        <Label className="text-xs">{t("discover.filter.platform")}</Label>
        <Select
          value={filters.platform ?? "all"}
          onValueChange={(v) => onUpdate({ platform: v === "all" || !v ? undefined : v })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("discover.filter.allPlatforms")}</SelectItem>
            {PLATFORM_ORDER.filter((p) => p !== "website").map((p) => {
              const meta = getPlatformMeta(p);
              return (
                <SelectItem key={p} value={p}>
                  {meta.name}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Follower Range */}
      <div className="space-y-1.5">
        <Label className="text-xs">{t("discover.filter.followerRange")}</Label>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Min"
            min={0}
            value={filters.followerMin ?? ""}
            onChange={(e) =>
              onUpdate({
                followerMin: e.target.value ? parseInt(e.target.value) : undefined,
              })
            }
          />
          <Input
            type="number"
            placeholder="Max"
            min={0}
            value={filters.followerMax ?? ""}
            onChange={(e) =>
              onUpdate({
                followerMax: e.target.value ? parseInt(e.target.value) : undefined,
              })
            }
          />
        </div>
      </div>

      {/* Location */}
      <div className="space-y-1.5">
        <Label className="text-xs">{t("discover.filter.location")}</Label>
        <Input
          placeholder={t("discover.filter.locationPlaceholder")}
          value={filters.location ?? ""}
          onChange={(e) =>
            onUpdate({ location: e.target.value || undefined })
          }
        />
      </div>

      {/* Verified Only */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={filters.verifiedOnly ?? false}
          onChange={(e) => onUpdate({ verifiedOnly: e.target.checked || undefined })}
          className="size-4 rounded border-input accent-primary"
        />
        <span className="text-sm">{t("discover.filter.verified")}</span>
      </label>

      {/* Clear */}
      {activeCount > 0 && (
        <Button variant="ghost" size="sm" className="w-full" onClick={onClear}>
          <X className="size-3.5" />
          {t("discover.clearFilters")}
        </Button>
      )}
    </div>
  );
}
