import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n";
import type { ProfileStatus } from "@/types";

const statusStyles: Record<ProfileStatus, string> = {
  draft: "border-yellow-500 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  published: "border-green-500 bg-green-500/10 text-green-700 dark:text-green-400",
  archived: "border-gray-500 bg-gray-500/10 text-gray-600 dark:text-gray-400",
};

interface ProfileStatusBadgeProps {
  status: ProfileStatus;
  className?: string;
}

export function ProfileStatusBadge({ status, className }: ProfileStatusBadgeProps) {
  const { t } = useTranslation();

  return (
    <span
      className={cn(
        "rounded-full border px-2 py-0.5 text-xs font-medium",
        statusStyles[status],
        className,
      )}
    >
      {t(`profile.status.${status}`)}
    </span>
  );
}
