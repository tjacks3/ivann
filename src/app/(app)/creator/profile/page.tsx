"use client";

import { ProfileHeader } from "@/components/profile/profile-header";
import { PlatformGrid, type PlatformData } from "@/components/profile/platform-grid";
import { PageContainer } from "@/components/shared/page-container";
import { SectionHeader } from "@/components/shared/section-header";
import { useTranslation } from "@/i18n";

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

export default function CreatorProfilePage() {
  const { t } = useTranslation();

  return (
    <PageContainer size="narrow">
      <div className="space-y-8">
        <ProfileHeader {...mockProfile} />
        <div>
          <SectionHeader title={t("profile.connectedPlatforms")} as="h2" />
          <div className="mt-4">
            <PlatformGrid platforms={mockPlatforms} />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
