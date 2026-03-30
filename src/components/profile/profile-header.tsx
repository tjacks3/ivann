import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

interface ProfileHeaderProps {
  name: string;
  username: string;
  avatarUrl?: string;
  bio?: string;
  categories: string[];
  followers: number;
  isOwnProfile?: boolean;
}

function formatCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return count.toString();
}

export function ProfileHeader({
  name,
  username,
  avatarUrl,
  bio,
  categories,
  followers,
  isOwnProfile = false,
}: ProfileHeaderProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <section className="rounded-xl bg-secondary p-6 sm:p-8">
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        {/* Avatar */}
        <Avatar className="size-20 sm:size-24 text-lg">
          {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
          <AvatarFallback className="text-lg">{initials}</AvatarFallback>
        </Avatar>

        {/* Info */}
        <div className="flex flex-1 flex-col items-center gap-3 text-center sm:items-start sm:text-left">
          <div>
            <h1 className="text-2xl font-bold">{name}</h1>
            <p className="text-sm text-muted-foreground">@{username}</p>
          </div>

          {bio && (
            <p className="max-w-lg text-sm text-muted-foreground">{bio}</p>
          )}

          {/* Categories */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant="outline"
                  className="rounded-full border-primary/20 bg-primary/10 text-primary"
                >
                  {category}
                </Badge>
              ))}
            </div>
          )}

          {/* Stats + CTA */}
          <div className="flex items-center gap-4 pt-2">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Users className="size-4" />
              <span className="font-semibold text-foreground">
                {formatCount(followers)}
              </span>{" "}
              followers
            </div>
            <Button size="lg">
              {isOwnProfile ? "Edit Profile" : "Send Offer"}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
