import { z } from "zod";

export const createDealSchema = z.object({
  creatorId: z.string().uuid(),
  title: z.string().min(1).max(255),
  deliverables: z.string().max(2000).optional(),
  budget: z.number().int().positive().optional(),
  currency: z.string().length(3).default("usd"),
  timeline: z.string().max(255).optional(),
  notes: z.string().max(2000).optional(),
});

export type CreateDealValues = z.infer<typeof createDealSchema>;

export const updateDealSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  deliverables: z.string().max(2000).optional(),
  budget: z.number().int().positive().optional(),
  currency: z.string().length(3).optional(),
  timeline: z.string().max(255).optional(),
  notes: z.string().max(2000).optional(),
});

export type UpdateDealValues = z.infer<typeof updateDealSchema>;
