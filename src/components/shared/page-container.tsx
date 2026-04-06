import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

const sizeClasses = {
  default: "max-w-7xl",
  narrow: "max-w-3xl",
  wide: "max-w-screen-2xl",
} as const;

interface PageContainerProps {
  children: ReactNode;
  size?: keyof typeof sizeClasses;
  className?: string;
}

export function PageContainer({
  children,
  size = "default",
  className,
}: PageContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 py-8 sm:px-6 lg:px-8",
        sizeClasses[size],
        className,
      )}
    >
      {children}
    </div>
  );
}
