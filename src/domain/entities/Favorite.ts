import { z } from "zod";
import { MovieSchema, SeasonSchema } from "./Movie";

/**
 * Media type enum for favorites
 * Distinguishes between movies and series
 */
export const MediaTypeEnum = z.enum(["movie", "series"]);
export type MediaType = z.infer<typeof MediaTypeEnum>;

/**
 * Platform options for favorites
 */
export const PlatformEnum = z.enum([
  "Spotify",
  "Deezer",
  "Tidal",
  "Netflix",
  "Hulu",
  "Disney+",
]);
export type Platform = z.infer<typeof PlatformEnum>;

export const FavoriteSourceEnum = z.enum(["catalog", "manual"]);
export type FavoriteSource = z.infer<typeof FavoriteSourceEnum>;

const LEGACY_MANUAL_ID_REGEX = /^\d{12,}$/;

function inferFavoriteSource(input: { id: string; platform?: Platform }): FavoriteSource {
  if (input.id.startsWith("custom-")) {
    return "manual";
  }

  if (input.platform) {
    return "manual";
  }

  if (LEGACY_MANUAL_ID_REGEX.test(input.id)) {
    return "manual";
  }

  return "catalog";
}

/**
 * Zod schema for Favorite entity
 * Represents a user's favorite movie or series with metadata
 */
export const FavoriteSchema = z.object({
  id: z.string(),
  title: z.string(), // Renamed from primaryTitle
  mediaType: MediaTypeEnum, // NEW: required field
  url: z.string().optional(), // Optional per product decision
  platform: PlatformEnum.optional(), // Optional per product decision
  description: z.string().optional(),
  cast: z.array(z.string()).optional(),
  releaseDate: z.string().optional(),
  whereToWatch: z.array(z.string()).optional(),
  seasons: z.array(SeasonSchema).optional(),
  source: FavoriteSourceEnum.optional(),
  addedAt: z.string().datetime().optional(), // ISO 8601 datetime string
});

const RequiredFavoriteTextSchema = z.string().trim().min(1);
const RequiredFavoriteArraySchema = z.array(RequiredFavoriteTextSchema).min(1);

export const FavoriteWithDetailsSchema = FavoriteSchema.extend({
  description: RequiredFavoriteTextSchema,
  cast: RequiredFavoriteArraySchema,
  releaseDate: RequiredFavoriteTextSchema,
  whereToWatch: RequiredFavoriteArraySchema,
  seasons: z.array(SeasonSchema).optional(),
}).superRefine((favorite, ctx) => {
  if (favorite.mediaType !== "series" || favorite.source !== "manual") {
    return;
  }

  if (!favorite.seasons || favorite.seasons.length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["seasons"],
      message: "Series favorites must include at least one season.",
    });
    return;
  }

  const hasInvalidSeason = favorite.seasons.some(
    (season) =>
      season.episodes.length === 0 ||
      season.episodes.some((episode) => !episode.releaseDate?.trim())
  );

  if (hasInvalidSeason) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["seasons"],
      message: "Every series episode must include a release date.",
    });
  }
});

/**
 * TypeScript type inferred from FavoriteSchema
 */
export type Favorite = z.infer<typeof FavoriteSchema>;

/**
 * Schema for creating a new favorite (without addedAt)
 */
export const FavoriteInputSchema = FavoriteSchema.omit({ addedAt: true });

/**
 * Type for creating a new favorite
 */
export type FavoriteInput = z.infer<typeof FavoriteInputSchema>;

/**
 * Schema for validating an array of favorites
 */
export const FavoriteArraySchema = z.array(FavoriteSchema);

/**
 * Legacy Favorite schema for backward compatibility
 * Handles old data format that might not have addedAt or mediaType
 */
export const LegacyFavoriteSchema = z.object({
  id: z.string(),
  primaryTitle: z.string(),
  url: z.string().optional(),
  platform: z.string().optional(),
  mediaType: MediaTypeEnum.optional(), // New field - may not exist in legacy
  addedAt: z.union([z.string().datetime(), z.number()]).optional(), // Support both string and timestamp
});

/**
 * Validates a favorite object against the schema
 * Throws ZodError if validation fails
 */
export function validateFavorite(data: unknown): Favorite {
  return FavoriteSchema.parse(data);
}

export function validateFavoriteWithDetails(data: unknown): Favorite {
  return FavoriteWithDetailsSchema.parse(data);
}

/**
 * Validates an array of favorites
 * Throws ZodError if validation fails
 */
export function validateFavorites(data: unknown): Favorite[] {
  return FavoriteArraySchema.parse(data);
}

export function validateFavoritesWithDetails(data: unknown): Favorite[] {
  return z.array(FavoriteWithDetailsSchema).parse(data);
}

/**
 * Safe validation - returns result object instead of throwing
 */
export function safeValidateFavorite(
  data: unknown
): { success: true; data: Favorite } | { success: false; error: z.ZodError } {
  const result = FavoriteSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}

/**
 * Converts legacy favorite format to new format
 * Handles migration from old data structures
 */
export function migrateLegacyFavorite(data: unknown): Favorite {
  const parsed = LegacyFavoriteSchema.parse(data);

  // Normalize addedAt to ISO string
  let addedAt: string | undefined;
  if (parsed.addedAt) {
    if (typeof parsed.addedAt === "number") {
      // Convert timestamp to ISO string
      addedAt = new Date(parsed.addedAt).toISOString();
    } else {
      addedAt = parsed.addedAt;
    }
  } else {
    // Default to now if missing
    addedAt = new Date().toISOString();
  }

  return {
    id: parsed.id,
    title: parsed.primaryTitle, // Map primaryTitle → title
    mediaType: parsed.mediaType ?? "movie", // Default to movie if not present
    url: parsed.url,
    platform: (() => {
      if (!parsed.platform) return undefined;
      const parsedPlatform = PlatformEnum.safeParse(parsed.platform);
      return parsedPlatform.success ? parsedPlatform.data : undefined;
    })(),
    source: inferFavoriteSource({
      id: parsed.id,
      platform: (() => {
        if (!parsed.platform) return undefined;
        const parsedPlatform = PlatformEnum.safeParse(parsed.platform);
        return parsedPlatform.success ? parsedPlatform.data : undefined;
      })(),
    }),
    addedAt,
  };
}

/**
 * Validates and migrates an array of favorites
 * Handles mixed old/new data formats
 */
export function validateAndMigrateFavorites(data: unknown): Favorite[] {
  if (!Array.isArray(data)) {
    throw new Error("Invalid favorites data: expected an array");
  }

  return data.map((item) => {
    // Try new schema first
    const newResult = FavoriteSchema.safeParse(item);
    if (newResult.success) {
      return {
        ...newResult.data,
        source:
          newResult.data.source ||
          inferFavoriteSource({
            id: newResult.data.id,
            platform: newResult.data.platform,
          }),
      };
    }

    // Fall back to legacy migration
    try {
      return migrateLegacyFavorite(item);
    } catch {
      // If both fail, throw with context
      throw new Error(
        `Invalid favorite data: ${JSON.stringify(item).slice(0, 100)}`
      );
    }
  });
}

/**
 * Validates backup payloads from external storage providers.
 */
export function validateBackupFavorites(data: unknown): Favorite[] {
  return validateAndMigrateFavorites(data);
}

/**
 * Creates a new favorite from movie data
 */
export function createFavorite(
  movie: z.infer<typeof MovieSchema>,
  overrides?: Partial<FavoriteInput>
): Favorite {
  const input = FavoriteInputSchema.parse({
    id: movie.id,
    title: movie.primaryTitle, // Map primaryTitle → title
    mediaType: "movie", // Default to movie for TMDB movies
    url: movie.primaryImage?.url,
    source: "catalog",
    ...overrides,
  });

  return {
    ...input,
    addedAt: new Date().toISOString(),
  };
}
