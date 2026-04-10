import { z } from "zod";

export const discoverFiltersSchema = z.object({
  keyword: z.string().optional(),
  categories: z.array(z.string()).optional(),
  platform: z.string().optional(),
  followerMin: z.number().int().min(0).optional(),
  followerMax: z.number().int().min(0).optional(),
  location: z.string().optional(),
  verifiedOnly: z.boolean().optional(),
  sort: z.enum(["followers", "newest", "az"]).default("followers"),
  page: z.number().int().min(0).default(0),
});

export type DiscoverFilters = z.infer<typeof discoverFiltersSchema>;
