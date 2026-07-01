import { z } from "zod";

export const PublicProfileSchema = z.object({
  id: z.string(),
  handle: z.string(),
  displayName: z.string(),
  bio: z.string().nullable().optional(),
  isPublic: z.boolean(),
  createdAt: z.string().datetime(),
});

export type PublicProfile = z.infer<typeof PublicProfileSchema>;

export const PublicProfileUpdateSchema = z.object({
  displayName: z.string().min(1).optional(),
  bio: z.string().max(500).optional(),
  isPublic: z.boolean().optional(),
});

export type PublicProfileUpdate = z.infer<typeof PublicProfileUpdateSchema>;
