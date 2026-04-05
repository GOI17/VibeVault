import { z } from "zod";
import { MovieSearchResponseSchema } from "../entities/Movie";

/**
 * TMDB API Response Schemas
 *
 * This file contains Zod schemas for validating TMDB API responses.
 * All API responses should be validated using these schemas before use.
 */

/**
 * Schema for TMDB API error response
 */
export const TMDBErrorSchema = z.object({
  status_code: z.number(),
  status_message: z.string(),
  success: z.boolean().optional(),
});

/**
 * Schema for TMDB API search request parameters
 */
export const TMDBSearchParamsSchema = z.object({
  query: z.string().min(1).max(100),
  page: z.number().int().min(1).max(1000).optional(),
  include_adult: z.boolean().optional(),
  language: z.string().optional(),
  year: z.number().int().optional(),
});

/**
 * Schema for TMDB API search response (detailed)
 * This is the raw API response before transformation
 */
export const TMDBSearchResponseSchema = z.object({
  page: z.number().int(),
  results: z.array(
    z.object({
      id: z.union([z.string(), z.number()]),
      title: z.string().optional(),
      name: z.string().optional(),
      poster_path: z.string().nullable().optional(),
      backdrop_path: z.string().nullable().optional(),
      overview: z.string().optional(),
      release_date: z.string().optional(),
      first_air_date: z.string().optional(),
      vote_average: z.number().optional(),
      vote_count: z.number().optional(),
      popularity: z.number().optional(),
      genre_ids: z.array(z.number()).optional(),
      media_type: z.enum(["movie", "tv", "person"]).optional(),
    })
  ),
  total_pages: z.number().int(),
  total_results: z.number().int(),
});

/**
 * Schema for TMDB API movie details response
 */
export const TMDBMovieDetailsSchema = z.object({
  id: z.union([z.string(), z.number()]),
  title: z.string(),
  original_title: z.string().optional(),
  overview: z.string().optional(),
  poster_path: z.string().nullable().optional(),
  backdrop_path: z.string().nullable().optional(),
  release_date: z.string().optional(),
  runtime: z.number().optional(),
  vote_average: z.number().optional(),
  vote_count: z.number().optional(),
  popularity: z.number().optional(),
  genres: z
    .array(
      z.object({
        id: z.number(),
        name: z.string(),
      })
    )
    .optional(),
  production_countries: z
    .array(
      z.object({
        iso_3166_1: z.string(),
        name: z.string(),
      })
    )
    .optional(),
  spoken_languages: z
    .array(
      z.object({
        iso_639_1: z.string(),
        name: z.string(),
      })
    )
    .optional(),
  adult: z.boolean().optional(),
});

/**
 * Schema for TMDB API configuration response
 */
export const TMDBConfigSchema = z.object({
  images: z.object({
    base_url: z.string(),
    secure_base_url: z.string(),
    backdrop_sizes: z.array(z.string()),
    logo_sizes: z.array(z.string()),
    poster_sizes: z.array(z.string()),
    profile_sizes: z.array(z.string()),
    still_sizes: z.array(z.string()),
  }),
  change_keys: z.array(z.string()),
});

/**
 * Schema for TMDB API genre list response
 */
export const TMDBGenreListSchema = z.object({
  genres: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
    })
  ),
});

/**
 * Type exports
 */
export type TMDBError = z.infer<typeof TMDBErrorSchema>;
export type TMDBSearchParams = z.infer<typeof TMDBSearchParamsSchema>;
export type TMDBSearchResponse = z.infer<typeof TMDBSearchResponseSchema>;
export type TMDBMovieDetails = z.infer<typeof TMDBMovieDetailsSchema>;
export type TMDBConfig = z.infer<typeof TMDBConfigSchema>;
export type TMDBGenreList = z.infer<typeof TMDBGenreListSchema>;

/**
 * Validates TMDB API search response
 * Throws ZodError if validation fails
 */
export function validateTMDBSearchResponse(data: unknown): TMDBSearchResponse {
  return TMDBSearchResponseSchema.parse(data);
}

/**
 * Validates TMDB API movie details response
 * Throws ZodError if validation fails
 */
export function validateTMDBMovieDetails(data: unknown): TMDBMovieDetails {
  return TMDBMovieDetailsSchema.parse(data);
}

/**
 * Validates TMDB API error response
 */
export function validateTMDBError(data: unknown): TMDBError | null {
  const result = TMDBErrorSchema.safeParse(data);
  return result.success ? result.data : null;
}

/**
 * Checks if response is an error
 */
export function isTMDBError(data: unknown): boolean {
  return TMDBErrorSchema.safeParse(data).success;
}

/**
 * Safe validation for search response
 */
export function safeValidateTMDBSearchResponse(
  data: unknown
): { success: true; data: TMDBSearchResponse } | { success: false; error: z.ZodError } {
  const result = TMDBSearchResponseSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}

/**
 * Transforms TMDB API response to our MovieSearchResponse format
 * This adapts external API structure to our domain model
 */
export function transformTMDBToMovieSearchResponse(
  tmdbResponse: TMDBSearchResponse
): z.infer<typeof MovieSearchResponseSchema> {
  const titles = tmdbResponse.results.map((result) => ({
    id: String(result.id),
    type: result.media_type || "movie",
    primaryTitle: result.title || result.name || "Unknown",
    originalTitle: result.title || result.name,
    primaryImage: result.poster_path
      ? {
          url: result.poster_path,
          width: 500,
          height: 750,
          type: "POSTER" as const,
        }
      : undefined,
    startYear: result.release_date
      ? parseInt(result.release_date.split("-")[0], 10)
      : result.first_air_date
        ? parseInt(result.first_air_date.split("-")[0], 10)
        : undefined,
    rating: result.vote_average
      ? {
          aggregateRating: result.vote_average,
          voteCount: result.vote_count || 0,
        }
      : undefined,
  }));

  return { titles };
}

/**
 * Validates and transforms TMDB API response
 * Combines validation with transformation
 */
export function validateAndTransformTMDBResponse(
  data: unknown
): z.infer<typeof MovieSearchResponseSchema> {
  const validated = validateTMDBSearchResponse(data);
  return transformTMDBToMovieSearchResponse(validated);
}
