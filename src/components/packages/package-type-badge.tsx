import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const typeConfig: Record<string, { label: string; className: string }> = {
  ugc: { label: "UGC", className: "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400" },
  sponsored_post: { label: "Sponsored Post", className: "border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-400" },
  story: { label: "Story", className: "border-pink-500/30 bg-pink-500/10 text-pink-700 dark:text-pink-400" },
  reel: { label: "Reel", className: "border-orange-500/30 bg-orange-500/10 text-orange-700 dark:text-orange-400" },
  video: { label: "Video", className: "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400" },
  bundle: { label: "Bundle", className: "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400" },
  custom: { label: "Custom", className: "border-gray-500/30 bg-gray-500/10 text-gray-600 dark:text-gray-400" },
};

interface PackageTypeBadgeProps {
  type: string;
  className?: string;
}

export function PackageTypeBadge({ type, className }: PackageTypeBadgeProps) {
  const config = typeConfig[type] ?? typeConfig.custom;

  return (
    <Badge
      variant="outline"
      className={cn("rounded-full text-xs font-medium", config.className, className)}
    >
      {config.label}
    </Badge>
  );
}
