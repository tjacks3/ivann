import { Sparkles, TrendingUp, Handshake, MapPin } from "lucide-react";
import type { ComponentType } from "react";

export interface PackageTemplate {
  id: string;
  icon: ComponentType<{ className?: string }>;
  defaults: {
    title: string;
    description: string;
    type: "ugc" | "sponsored_post" | "story" | "reel" | "video" | "bundle" | "custom";
    deliverables: string[];
    priceInCents: number;
    deliveryDays: number;
    revisions: number;
  };
}

export const PACKAGE_TEMPLATES: PackageTemplate[] = [
  {
    id: "starter_exposure",
    icon: Sparkles,
    defaults: {
      title: "Starter Exposure",
      description: "A simple, one-time promotion to introduce your brand to my audience.",
      type: "sponsored_post",
      deliverables: [
        "1 Instagram Post or Story",
        "Brand mention with tags",
        "24-hour story or permanent feed post",
      ],
      priceInCents: 5000,
      deliveryDays: 5,
      revisions: 1,
    },
  },
  {
    id: "growth_bundle",
    icon: TrendingUp,
    defaults: {
      title: "Growth Bundle",
      description: "Multiple touchpoints over 1–2 weeks to build sustained brand visibility.",
      type: "bundle",
      deliverables: [
        "2 Feed Posts",
        "3 Instagram Stories",
        "1 Short-form Video (Reel or TikTok)",
        "Brand hashtag usage",
      ],
      priceInCents: 25000,
      deliveryDays: 14,
      revisions: 2,
    },
  },
  {
    id: "ongoing_partnership",
    icon: Handshake,
    defaults: {
      title: "Ongoing Partnership",
      description: "A continuous brand relationship with regular content over 1–3 months.",
      type: "bundle",
      deliverables: [
        "Weekly or bi-weekly content",
        "Dedicated brand ambassador posts",
        "Story mentions and engagement",
        "Monthly performance check-in",
      ],
      priceInCents: 75000,
      deliveryDays: 30,
      revisions: 2,
    },
  },
  {
    id: "local_boost",
    icon: MapPin,
    defaults: {
      title: "Local Boost",
      description: "Perfect for restaurants, shops, and local service businesses wanting nearby visibility.",
      type: "story",
      deliverables: [
        "Visit-based content (photo or video at your location)",
        "Location tag and geo-relevant hashtags",
        "Story or Reel with honest review",
      ],
      priceInCents: 7500,
      deliveryDays: 7,
      revisions: 1,
    },
  },
];

export function getTemplateById(id: string): PackageTemplate | undefined {
  return PACKAGE_TEMPLATES.find((t) => t.id === id);
}
