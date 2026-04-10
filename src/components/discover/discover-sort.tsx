"use client";

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "@/i18n";

interface DiscoverSortProps {
  value: string;
  onChange: (value: string) => void;
}

type SelectChangeHandler = (value: string | null) => void;

export function DiscoverSort({ value, onChange }: DiscoverSortProps) {
  const { t } = useTranslation();

  return (
    <Select value={value} onValueChange={((v: string | null) => { if (v) onChange(v); }) as SelectChangeHandler}>
      <SelectTrigger className="w-[160px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="followers">{t("discover.sort.followers")}</SelectItem>
        <SelectItem value="newest">{t("discover.sort.newest")}</SelectItem>
        <SelectItem value="az">{t("discover.sort.az")}</SelectItem>
      </SelectContent>
    </Select>
  );
}
