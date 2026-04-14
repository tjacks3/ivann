import { z } from "zod";

export const roleSchema = z.object({
  role: z.enum(["creator", "brand"]),
});

export const creatorProfileSchema = z.object({
  fullName: z.string().min(2).max(255),
  username: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[a-zA-Z0-9_]+$/, "Letters, numbers, and underscores only"),
  bio: z.string().max(500).optional().or(z.literal("")),
  categories: z.array(z.string()).min(1, "Select at least one category"),
  location: z.string().max(100).optional().or(z.literal("")),
});

export const creatorImageSchema = z.object({
  avatarUrl: z.string().optional(),
});

export const brandProfileSchema = z.object({
  brandName: z.string().min(2).max(255),
  contactName: z.string().min(2).max(255),
  companyWebsite: z.string().url().optional().or(z.literal("")),
  bio: z.string().max(500).optional().or(z.literal("")),
  industry: z.string().min(1, "Required"),
  location: z.string().min(1, "Required").max(100),
});

export type RoleValues = z.infer<typeof roleSchema>;
export type CreatorProfileValues = z.infer<typeof creatorProfileSchema>;
export type CreatorImageValues = z.infer<typeof creatorImageSchema>;
export type BrandProfileValues = z.infer<typeof brandProfileSchema>;
