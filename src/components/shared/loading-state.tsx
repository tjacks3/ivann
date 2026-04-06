import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface LoadingStateProps {
  variant?: "spinner" | "skeleton" | "page";
  count?: number;
  className?: string;
}

export function LoadingState({
  variant = "spinner",
  count = 6,
  className,
}: LoadingStateProps) {
  if (variant === "page") {
    return (
      <div className={cn("flex min-h-[60vh] items-center justify-center", className)}>
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (variant === "skeleton") {
    return (
      <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="space-y-3 rounded-xl border p-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-20 w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("flex items-center justify-center py-16", className)}>
      <Loader2 className="size-6 animate-spin text-muted-foreground" />
    </div>
  );
}
