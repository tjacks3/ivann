import { z } from "zod";

export const collaborationRequestSchema = z.object({
  creatorId: z.string().uuid(),
  packageId: z.string().uuid().optional(),
  title: z.string().min(2, "Title is required").max(255),
  message: z.string().min(10, "Please provide more detail").max(2000),
  budget: z.number().int().min(0).optional(),
  currency: z.string().min(3).max(3),
  deadline: z.string().optional(),
});

export type CollaborationRequestValues = z.infer<typeof collaborationRequestSchema>;
