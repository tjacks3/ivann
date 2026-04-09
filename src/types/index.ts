// Shared application types

export type UserRole = "creator" | "brand" | "admin";

export type ProfileStatus = "draft" | "published" | "archived";

export type HeaderVariant = "marketing" | "app";

export interface NavItem {
  href: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}
