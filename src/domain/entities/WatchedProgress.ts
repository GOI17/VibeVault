import { z } from "zod";

const WatchedAtSchema = z.string().datetime();

export const WatchedMovieSchema = z.object({
  mediaId: z.string().trim().min(1),
  mediaType: z.literal("movie"),
  watched: z.boolean(),
  watchedAt: WatchedAtSchema.optional(),
});

export const WatchedEpisodeSchema = z.object({
  mediaId: z.string().trim().min(1),
  mediaType: z.literal("series"),
  seasonNumber: z.number().int().nonnegative(),
  episodeNumber: z.number().int().nonnegative(),
  watched: z.boolean(),
  watchedAt: WatchedAtSchema.optional(),
});

export const WatchedEpisodeInputSchema = WatchedEpisodeSchema.pick({
  mediaId: true,
  seasonNumber: true,
  episodeNumber: true,
  watched: true,
});

export const WatchedProgressStoreSchema = z.object({
  movies: z.array(WatchedMovieSchema).default([]),
  episodes: z.array(WatchedEpisodeSchema).default([]),
});

export type WatchedMovie = z.infer<typeof WatchedMovieSchema>;
export type WatchedEpisode = z.infer<typeof WatchedEpisodeSchema>;
export type WatchedEpisodeInput = z.infer<typeof WatchedEpisodeInputSchema>;
export type WatchedProgressStore = z.infer<typeof WatchedProgressStoreSchema>;

export function createEpisodeWatchedKey(seasonNumber: number, episodeNumber: number): string {
  return `${seasonNumber}:${episodeNumber}`;
}

export function validateWatchedProgressStore(data: unknown): WatchedProgressStore {
  return WatchedProgressStoreSchema.parse(data);
}
