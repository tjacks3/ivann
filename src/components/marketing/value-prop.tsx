import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ValuePropProps {
  title: string;
  description: string;
  icon: LucideIcon;
  features?: string[];
  reversed?: boolean;
}

export function ValueProp({
  title,
  description,
  icon: Icon,
  features,
  reversed = false,
}: ValuePropProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-10 lg:flex-row lg:gap-16",
        reversed && "lg:flex-row-reverse",
      )}
    >
      {/* Visual / icon block */}
      <div className="flex w-full items-center justify-center lg:w-1/2">
        <div className="flex size-32 items-center justify-center rounded-3xl bg-primary/10 sm:size-40">
          <Icon className="size-16 text-primary sm:size-20" />
        </div>
      </div>

      {/* Content */}
      <div className="w-full space-y-4 text-center lg:w-1/2 lg:text-left">
        <h3 className="text-2xl font-bold sm:text-3xl">{title}</h3>
        <p className="text-base leading-relaxed text-muted-foreground">
          {description}
        </p>
        {features && features.length > 0 && (
          <ul className="space-y-2 text-sm text-muted-foreground">
            {features.map((f) => (
              <li key={f} className="flex items-start gap-2">
                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
                {f}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
