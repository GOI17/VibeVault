import { z } from "zod";

export const EpisodeSchema = z.object({
  episodeNumber: z.number(),
  title: z.string(),
  releaseDate: z.string().optional(),
});

export const SeasonSchema = z.object({
  seasonNumber: z.number(),
  title: z.string().optional(),
  episodes: z.array(EpisodeSchema),
});

const RequiredTextSchema = z.string().trim().min(1);

export const EpisodeDetailsSchema = EpisodeSchema.extend({
  title: RequiredTextSchema,
  releaseDate: RequiredTextSchema,
});

export const SeasonDetailsSchema = SeasonSchema.extend({
  episodes: z.array(EpisodeDetailsSchema).min(1),
});

/**
 * Zod schema for Movie entity
 * Represents a movie from TMDB API with all relevant fields
 */
export const MovieSchema = z.object({
  id: z.string(),
  type: z.string(),
  primaryTitle: z.string(),
  originalTitle: z.string().optional(),
  primaryImage: z
    .object({
      url: z.string(),
      width: z.number().optional(),
      height: z.number().optional(),
      type: z
        .enum([
          "POSTER",
          "STILL_FRAME",
          "EVENT",
          "BEHIND_THE_SCENES",
          "PUBLICITY",
          "PRODUCTION_ART",
        ])
        .optional(),
    })
    .optional(),
  genres: z.array(z.string()).optional(),
  startYear: z.number().optional(),
  endYear: z.number().optional(),
  runtimeSeconds: z.number().optional(),
  plot: z.string().optional(),
  cast: z.array(z.string()).optional(),
  releaseDate: z.string().optional(),
  whereToWatch: z.array(z.string()).optional(),
  seasons: z.array(SeasonSchema).optional(),
  isAdult: z.boolean().optional(),
  originCountries: z
    .array(
      z.object({
        code: z.string(),
        name: z.string(),
      })
    )
    .optional(),
  spokenLanguages: z
    .array(
      z.object({
        code: z.string(),
        name: z.string(),
      })
    )
    .optional(),
  rating: z
    .object({
      aggregateRating: z.number(),
      voteCount: z.number(),
    })
    .optional(),
});

export const MovieDetailsSchema = MovieSchema.extend({
  plot: RequiredTextSchema,
  cast: z.array(RequiredTextSchema).min(1),
  releaseDate: RequiredTextSchema,
  whereToWatch: z.array(RequiredTextSchema).min(1),
  seasons: z.array(SeasonDetailsSchema).optional(),
}).superRefine((movie, ctx) => {
  const normalizedType = movie.type.toLowerCase();
  const isSeries = normalizedType.includes("tv") || normalizedType.includes("series");

  if (!isSeries) {
    return;
  }

  if (!movie.seasons || movie.seasons.length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["seasons"],
      message: "Series titles must include at least one season with episodes.",
    });
  }
});

/**
 * TypeScript type inferred from MovieSchema
 * Use this for type annotations throughout the app
 */
export type Movie = z.infer<typeof MovieSchema>;
export type MovieDetails = z.infer<typeof MovieDetailsSchema>;
export type Episode = z.infer<typeof EpisodeSchema>;
export type Season = z.infer<typeof SeasonSchema>;

/**
 * Schema for validating an array of movies
 */
export const MovieArraySchema = z.array(MovieSchema);

/**
 * Schema for TMDB API search response
 */
export const MovieSearchResponseSchema = z.object({
  titles: z.array(MovieSchema),
});

/**
 * Type for TMDB API search response
 */
export type MovieSearchResponse = z.infer<typeof MovieSearchResponseSchema>;

/**
 * Type for movie search result items
 * Simplified version for UI display
 */
export type MovieSearchResultItem = Pick<Movie, "id" | "primaryTitle"> & {
  posterPath?: string;
  rating?: number;
  year?: number;
};

/**
 * Helper function to convert Movie to MovieSearchResultItem
 * Used for transforming API responses to UI-friendly format
 */
export function toSearchResultItem(movie: Movie): MovieSearchResultItem {
  return {
    id: movie.id,
    primaryTitle: movie.primaryTitle,
    posterPath: movie.primaryImage?.url,
    rating: movie.rating?.aggregateRating,
    year: movie.startYear,
  };
}

/**
 * Validates a movie object against the schema
 * Throws ZodError if validation fails
 */
export function validateMovie(data: unknown): Movie {
  return MovieSchema.parse(data);
}

export function validateMovieDetails(data: unknown): MovieDetails {
  return MovieDetailsSchema.parse(data);
}

/**
 * Validates an array of movies
 * Throws ZodError if validation fails
 */
export function validateMovies(data: unknown): Movie[] {
  return MovieArraySchema.parse(data);
}

/**
 * Safe validation - returns result object instead of throwing
 */
export function safeValidateMovie(
  data: unknown
): { success: true; data: Movie } | { success: false; error: z.ZodError } {
  const result = MovieSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}
