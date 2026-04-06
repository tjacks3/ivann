import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface SectionHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  as?: "h1" | "h2" | "h3";
  className?: string;
}

export function SectionHeader({
  title,
  description,
  action,
  as: Tag = "h1",
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between", className)}>
      <div>
        <Tag className="text-2xl font-bold">{title}</Tag>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action && <div className="mt-3 sm:mt-0 sm:shrink-0">{action}</div>}
    </div>
  );
}
