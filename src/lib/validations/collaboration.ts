import { z } from "zod";

export const collaborationRequestSchema = z.object({
  creatorId: z.string().uuid(),
  packageId: z.string().uuid().optional(),
  title: z.string().min(2, "Title is required").max(255),
  description: z.string().max(2000).optional(),
  deliverables: z.array(z.string()).optional(),
  type: z.enum(["ugc", "sponsored_post", "story", "reel", "video", "bundle", "custom"]).optional(),
  message: z.string().max(2000).optional(),
  budget: z.number().int().min(0).optional(),
  currency: z.string().min(3).max(3),
  deadline: z.string().optional(),
});

export type CollaborationRequestValues = z.infer<typeof collaborationRequestSchema>;
