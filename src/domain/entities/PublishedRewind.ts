import { z } from "zod";

export const PublishedRewindSchema = z.object({
  user: z.object({ id: z.string(), handle: z.string() }).optional(),
  year: z.number().int(),
  moviesWatched: z.number().int().min(0),
  episodesWatched: z.number().int().min(0),
  seriesCount: z.number().int().min(0),
  topMovieTitle: z.string().nullable().optional(),
  topSeriesTitle: z.string().nullable().optional(),
  payload: z.record(z.string(), z.unknown()).optional(),
  createdAt: z.string().datetime(),
});

export type PublishedRewind = z.infer<typeof PublishedRewindSchema>;

export const PublishedRewindInputSchema = PublishedRewindSchema.omit({
  user: true,
  createdAt: true,
});

export type PublishedRewindInput = z.infer<typeof PublishedRewindInputSchema>;
