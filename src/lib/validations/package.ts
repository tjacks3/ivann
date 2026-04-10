import { z } from "zod";

export const packageFormSchema = z.object({
  title: z.string().min(2, "Title is required").max(255),
  description: z.string().max(1000).optional().or(z.literal("")),
  type: z.enum([
    "ugc",
    "sponsored_post",
    "story",
    "reel",
    "video",
    "bundle",
    "custom",
  ]),
  priceInCents: z.number().int().min(100, "Minimum price is 1.00"),
  currency: z.string().min(3).max(3),
  deliveryDays: z
    .number()
    .int()
    .min(1)
    .max(365)
    .optional()
    .or(z.literal(0).transform(() => undefined)),
  revisions: z
    .number()
    .int()
    .min(0)
    .max(10)
    .optional()
    .or(z.literal(0).transform(() => undefined)),
  status: z.enum(["draft", "active", "archived"]),
});

export type PackageFormValues = z.infer<typeof packageFormSchema>;
