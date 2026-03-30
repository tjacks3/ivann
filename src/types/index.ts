// Shared application types

export type UserRole = "creator" | "brand" | "admin";

export interface NavItem {
  href: string;
  label: string;
  icon?: string;
}
