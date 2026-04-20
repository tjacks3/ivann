import { z } from "zod";

export const briefSchema = z.object({
  campaignGoal: z.string().min(10).max(1000),
  productOrService: z.string().min(2).max(255),
  requiredMentions: z.string().max(1000).optional(),
  tagsHashtags: z.string().max(500).optional(),
  location: z.string().max(255).optional(),
  postingWindowStart: z.string().optional(),
  postingWindowEnd: z.string().optional(),
  specialInstructions: z.string().max(2000).optional(),
  restrictions: z.string().max(1000).optional(),
});

export type BriefValues = z.infer<typeof briefSchema>;

export const deliverableSubmissionSchema = z.object({
  contentUrl: z.string().url(),
  note: z.string().max(2000).optional(),
});

export type DeliverableSubmissionValues = z.infer<
  typeof deliverableSubmissionSchema
>;

export const collabMessageSchema = z.object({
  body: z.string().min(1).max(2000),
});

export type CollabMessageValues = z.infer<typeof collabMessageSchema>;
