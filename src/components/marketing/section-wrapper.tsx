import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface SectionWrapperProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "muted" | "primary" | "dark";
  id?: string;
}

const variantStyles = {
  default: "bg-background text-foreground",
  muted: "bg-muted/50 text-foreground",
  primary: "bg-primary text-primary-foreground",
  dark: "bg-foreground text-background",
};

export function SectionWrapper({
  children,
  className,
  variant = "default",
  id,
}: SectionWrapperProps) {
  return (
    <section id={id} className={cn("py-16 sm:py-24", variantStyles[variant], className)}>
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </section>
  );
}
