import type { Metadata } from "next";
import { BrandLandingPage } from "@/components/marketing/pages/brand-landing";

export const metadata: Metadata = {
  title: "ivann for Brands — Find Creators Fast",
  description:
    "Discover vetted creators, send collaboration requests, and manage campaigns — all from one platform. No agencies, no middlemen.",
  openGraph: {
    title: "ivann for Brands — Find Creators Fast",
    description:
      "Find the right creators, launch campaigns, and track partnerships.",
    type: "website",
  },
};

export default function BrandsPage() {
  return <BrandLandingPage />;
}
