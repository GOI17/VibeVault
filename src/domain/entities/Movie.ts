import { z } from "zod";

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

/**
 * TypeScript type inferred from MovieSchema
 * Use this for type annotations throughout the app
 */
export type Movie = z.infer<typeof MovieSchema>;

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
