import { z } from "zod";

export const brandEditProfileSchema = z.object({
  brandName: z.string().min(2).max(255),
  contactName: z.string().min(2).max(255),
  companyWebsite: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  bio: z.string().max(500).optional().or(z.literal("")),
  industry: z.string().min(1, "Required"),
});

export type BrandEditProfileValues = z.infer<typeof brandEditProfileSchema>;
