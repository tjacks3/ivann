import type { Metadata } from "next";
import { MainLandingPage } from "@/components/marketing/pages/main-landing";

export const metadata: Metadata = {
  title: "ivann — The Creator Marketplace",
  description:
    "ivann connects creators with brands for paid collaborations. Build your profile, showcase your stats, and start earning.",
  openGraph: {
    title: "ivann — The Creator Marketplace",
    description:
      "Connect creators with brands for paid collaborations.",
    type: "website",
  },
};

export default function HomePage() {
  return <MainLandingPage />;
}
