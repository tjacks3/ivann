import type { Metadata } from "next";
import { ProfileHeader } from "@/components/profile/profile-header";
import { PlatformGrid, type PlatformData } from "@/components/profile/platform-grid";

export const metadata: Metadata = { title: "Profile" };

// TODO: Replace with real data from Supabase
const mockProfile = {
  name: "Alex Rivera",
  username: "alexrivera",
  bio: "Lifestyle & tech content creator. Helping brands tell their story through authentic content across platforms.",
  categories: ["Lifestyle", "Tech", "Photography"],
  followers: 142_500,
  isOwnProfile: true,
};

const mockPlatforms: PlatformData[] = [
  { platform: "Instagram", handle: "alexrivera", followers: 85_200, engagement: 3.8 },
  { platform: "YouTube", handle: "AlexRivera", followers: 42_000, engagement: 5.2 },
  { platform: "Twitter", handle: "alexrivera_", followers: 12_300, engagement: 2.1 },
  { platform: "TikTok", handle: "alex.rivera", followers: 3_000, engagement: 8.4 },
];

export default function ProfilePage() {
  return (
    <div className="space-y-8">
      <ProfileHeader {...mockProfile} />

      <div>
        <h2 className="mb-4 text-lg font-semibold">Connected Platforms</h2>
        <PlatformGrid platforms={mockPlatforms} />
      </div>
    </div>
  );
}
