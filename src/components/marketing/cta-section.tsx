import Link from "next/link";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

interface CtaButton {
  label: string;
  href: string;
  variant?: "default" | "outline" | "secondary" | "ghost";
}

interface CtaSectionProps {
  heading: string;
  description?: string;
  buttons: CtaButton[];
  align?: "center" | "left";
}

export function CtaSection({
  heading,
  description,
  buttons,
  align = "center",
}: CtaSectionProps) {
  return (
    <div className={cn("space-y-6", align === "center" && "text-center")}>
      <h2 className="text-3xl font-bold sm:text-4xl">{heading}</h2>
      {description && (
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          {description}
        </p>
      )}
      <div
        className={cn(
          "flex flex-wrap gap-3",
          align === "center" && "justify-center",
        )}
      >
        {buttons.map((btn) => (
          <Link
            key={btn.label}
            href={btn.href}
            className={buttonVariants({
              variant: btn.variant ?? "default",
              size: "lg",
            })}
          >
            {btn.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
