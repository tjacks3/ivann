import { Card, CardContent } from "@/components/ui/card";
import { Camera, Play, Bird, Globe, type LucideIcon } from "lucide-react";

const platformIcons: Record<string, LucideIcon> = {
  instagram: Camera,
  youtube: Play,
  twitter: Bird,
  tiktok: Globe,
  website: Globe,
};

interface PlatformCardProps {
  platform: string;
  handle: string;
  followers: number;
  engagement?: number;
}

function formatCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return count.toString();
}

export function PlatformCard({
  platform,
  handle,
  followers,
  engagement,
}: PlatformCardProps) {
  const Icon = platformIcons[platform.toLowerCase()] ?? Globe;

  return (
    <Card className="border-0 shadow-none transition-all hover:shadow-sm hover:scale-[1.02]">
      <CardContent className="flex items-center gap-4">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="size-5 text-primary" />
        </div>
        <div className="flex-1">
          <p className="font-medium capitalize">{platform}</p>
          <p className="text-xs text-muted-foreground">@{handle}</p>
        </div>
        <div className="text-right">
          <p className="font-semibold">{formatCount(followers)}</p>
          {engagement !== undefined && (
            <p className="text-xs text-muted-foreground">
              {engagement.toFixed(1)}% eng.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
