import type { LucideIcon } from "lucide-react";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface FeatureGridProps {
  features: Feature[];
  columns?: 2 | 3 | 4;
}

const colClasses = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
};

export function FeatureGrid({ features, columns = 3 }: FeatureGridProps) {
  return (
    <div className={`grid grid-cols-1 gap-8 ${colClasses[columns]}`}>
      {features.map((feature) => (
        <div key={feature.title} className="space-y-3">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10">
            <feature.icon className="size-6 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">{feature.title}</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {feature.description}
          </p>
        </div>
      ))}
    </div>
  );
}
