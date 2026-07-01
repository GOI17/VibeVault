import { z } from "zod";

export const PublishedProfileSchema = z.object({
  id: z.string(),
  handle: z.string(),
  displayName: z.string(),
  bio: z.string().nullable().optional(),
  createdAt: z.string().datetime(),
});

export type PublishedProfile = z.infer<typeof PublishedProfileSchema>;
