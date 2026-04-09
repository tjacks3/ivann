import { z } from "zod";

export const creatorEditProfileSchema = z.object({
  fullName: z.string().min(2).max(255),
  username: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[a-zA-Z0-9_]+$/, "Letters, numbers, and underscores only"),
  bio: z.string().max(500).optional().or(z.literal("")),
  categories: z.array(z.string()).min(1, "Select at least one category"),
  location: z.string().max(100).optional().or(z.literal("")),
  website: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  publicEmail: z.string().email("Enter a valid email").optional().or(z.literal("")),
  profileStatus: z.enum(["draft", "published", "archived"]),
});

export type CreatorEditProfileValues = z.infer<typeof creatorEditProfileSchema>;
