import { z } from "zod";

export const PublishedListItemSchema = z.object({
  mediaId: z.string(),
  title: z.string(),
  mediaType: z.enum(["movie", "series", "episode"]),
  addedAt: z.string().datetime(),
});

export const PublishedListSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  title: z.string(),
  description: z.string().nullable().optional(),
  isPublic: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  items: z.array(PublishedListItemSchema).optional(),
});

export type PublishedListItem = z.infer<typeof PublishedListItemSchema>;
export type PublishedList = z.infer<typeof PublishedListSchema>;

export const PublishedListInputSchema = PublishedListSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  items: z.array(PublishedListItemSchema.omit({ addedAt: true })).optional(),
});

export type PublishedListInput = z.infer<typeof PublishedListInputSchema>;

export const PublishedListUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  isPublic: z.boolean().optional(),
});

export type PublishedListUpdate = z.infer<typeof PublishedListUpdateSchema>;
