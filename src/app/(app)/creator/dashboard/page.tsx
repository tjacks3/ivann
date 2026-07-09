"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { PageContainer } from "@/components/shared/page-container";
import { LoadingState } from "@/components/shared/loading-state";
import { ProfileEditForm } from "@/components/profile/profile-edit-form";
import { PaymentSummaryCard } from "@/components/deals/payment-summary-card";
import { DealsDashboardSection } from "@/components/deals/deals-dashboard-section";
import { useCreatorProfile } from "@/hooks/use-creator-profile";
import { useMyDeals } from "@/hooks/use-deals";
import { useCollaborations } from "@/hooks/use-collaborations";
import { useTranslation } from "@/i18n";
import { getPaymentSummary, type PaymentSummary } from "@/app/(app)/deals/payment-actions";
import { X } from "lucide-react";

export default function CreatorDashboardPage() {
  const { t } = useTranslation();
  const { profile, isLoading, refetch: refetchProfile } = useCreatorProfile();
  const { deals, isLoading: dealsLoading } = useMyDeals();
  const { collaborations, isLoading: collabsLoading } = useCollaborations();
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary | null>(null);
  const [editProfileOpen, setEditProfileOpen] = useState(false);

  useEffect(() => {
    getPaymentSummary().then(setPaymentSummary);
  }, []);

  if (isLoading) {
    return <LoadingState variant="page" />;
  }

  if (!profile) {
    return null;
  }

  const initials = (profile.fullName || "")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <PageContainer>
      {/* Mini Profile Summary */}
      <div className="flex items-center gap-3">
        <Avatar className="size-10">
          {profile.avatarUrl && <AvatarImage src={profile.avatarUrl} alt={profile.fullName || ""} />}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-base font-semibold leading-tight">{profile.fullName}</h1>
          <p className="text-xs text-muted-foreground">Creator</p>
        </div>
      </div>

      {/* Payment Summary */}
      <div className="mt-6">
        <PaymentSummaryCard
          summary={paymentSummary ?? { totalReleased: 0, totalFunded: 0, currency: "usd", recentTransactions: [] }}
          isBrand={false}
        />
      </div>

      {/* Deals */}
      <div className="mt-6">
        <DealsDashboardSection
          deals={deals}
          collaborations={collaborations}
          isLoading={dealsLoading || collabsLoading}
          isBrand={false}
          limit={8}
        />
      </div>

      {/* Edit Profile Sheet */}
      <Sheet open={editProfileOpen} onOpenChange={setEditProfileOpen}>
        <SheetContent
          side="right"
          className="flex w-full flex-col overflow-hidden p-0 sm:max-w-lg"
          showCloseButton={false}
        >
          <div className="flex h-14 shrink-0 items-center justify-between border-b px-6">
            <SheetTitle className="text-base font-semibold">
              {t("profile.edit.title")}
            </SheetTitle>
            <SheetClose>
              <X className="size-5" />
            </SheetClose>
          </div>
          <ProfileEditForm
            profile={profile}
            onSaved={() => {
              setEditProfileOpen(false);
              refetchProfile();
            }}
            onCancel={() => setEditProfileOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </PageContainer>
  );
}
