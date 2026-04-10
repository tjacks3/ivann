import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n";

const statusStyles: Record<string, string> = {
  pending: "border-yellow-500 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  accepted: "border-green-500 bg-green-500/10 text-green-700 dark:text-green-400",
  declined: "border-red-500 bg-red-500/10 text-red-700 dark:text-red-400",
  expired: "border-gray-500 bg-gray-500/10 text-gray-600 dark:text-gray-400",
  cancelled: "border-gray-500 bg-gray-500/10 text-gray-600 dark:text-gray-400",
};

interface CollabStatusBadgeProps {
  status: string;
  className?: string;
}

export function CollabStatusBadge({ status, className }: CollabStatusBadgeProps) {
  const { t } = useTranslation();

  return (
    <span
      className={cn(
        "rounded-full border px-3 py-1.5 text-sm font-medium",
        statusStyles[status] ?? statusStyles.pending,
        className,
      )}
    >
      {t(`collab.status.${status}`)}
    </span>
  );
}
