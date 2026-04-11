import { z } from "zod";

import { SeasonSchema, type Season } from "@/domain/entities/Movie";

const ManualEpisodeSchema = z
  .object({
    episodeNumber: z.number().int().positive(),
    title: z.string().trim().min(1, "Episode title is required"),
    releaseDate: z.string().trim().min(1, "Episode release date is required"),
  })
  .strict();

const ManualSeasonSchema = z
  .object({
    seasonNumber: z.number().int().positive(),
    title: z.string().trim().optional(),
    episodes: z.array(ManualEpisodeSchema).min(1, "Season must include at least one episode"),
  })
  .strict();

export const ManualSeriesSeasonsSchema = z.array(ManualSeasonSchema).min(1, "At least one season is required");

export function parseManualSeriesSeasonsPayload(payload: string): Season[] {
  const parsed: unknown = JSON.parse(payload);
  return SeasonSchema.array().parse(ManualSeriesSeasonsSchema.parse(parsed));
}
