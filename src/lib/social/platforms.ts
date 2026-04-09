import type { IconType } from "react-icons";
import {
  FaInstagram,
  FaYoutube,
  FaTiktok,
  FaXTwitter,
  FaLinkedin,
  FaTwitch,
} from "react-icons/fa6";
import { Globe } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface PlatformMeta {
  name: string;
  icon: IconType | LucideIcon;
  oauthReady: boolean;
  urlPattern: string | null;
  color: string;
  handlePrefix: string;
}

export const PLATFORMS: Record<string, PlatformMeta> = {
  youtube: {
    name: "YouTube",
    icon: FaYoutube,
    oauthReady: false,
    urlPattern: "youtube.com/",
    color: "#FF0000",
    handlePrefix: "@",
  },
  instagram: {
    name: "Instagram",
    icon: FaInstagram,
    oauthReady: false,
    urlPattern: "instagram.com/",
    color: "#E4405F",
    handlePrefix: "@",
  },
  tiktok: {
    name: "TikTok",
    icon: FaTiktok,
    oauthReady: false,
    urlPattern: "tiktok.com/@",
    color: "#000000",
    handlePrefix: "@",
  },
  twitter: {
    name: "X",
    icon: FaXTwitter,
    oauthReady: false,
    urlPattern: "x.com/",
    color: "#000000",
    handlePrefix: "@",
  },
  linkedin: {
    name: "LinkedIn",
    icon: FaLinkedin,
    oauthReady: false,
    urlPattern: "linkedin.com/in/",
    color: "#0A66C2",
    handlePrefix: "",
  },
  twitch: {
    name: "Twitch",
    icon: FaTwitch,
    oauthReady: false,
    urlPattern: "twitch.tv/",
    color: "#9146FF",
    handlePrefix: "",
  },
  website: {
    name: "Website",
    icon: Globe as unknown as IconType,
    oauthReady: false,
    urlPattern: null,
    color: "#6B7280",
    handlePrefix: "",
  },
};

/** Platforms that support OAuth linking (future) */
export const OAUTH_PLATFORMS = ["youtube", "instagram", "tiktok"] as const;

/** All platform keys in display order */
export const PLATFORM_ORDER = [
  "youtube",
  "instagram",
  "tiktok",
  "twitter",
  "linkedin",
  "twitch",
  "website",
] as const;

export function getPlatformMeta(platform: string): PlatformMeta {
  return PLATFORMS[platform] ?? PLATFORMS.website;
}
