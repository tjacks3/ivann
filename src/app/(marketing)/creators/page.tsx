import type { Metadata } from "next";
import { CreatorLandingPage } from "@/components/marketing/pages/creator-landing";

export const metadata: Metadata = {
  title: "ivann for Creators — Monetize Your Influence",
  description:
    "Build your professional creator profile, list service packages, and receive paid collaboration requests from brands on ivann.",
  openGraph: {
    title: "ivann for Creators — Monetize Your Influence",
    description:
      "Build your profile, set your rates, and let brand deals come to you.",
    type: "website",
  },
};

export default function CreatorsPage() {
  return <CreatorLandingPage />;
}
