import { z } from "zod";
import type { IMovieRepository } from "@/domain/repositories/IMovieRepository";
import { movieTitles as movieTitlesSeed } from "@/constants/movieTitles";
import {
  MovieDetailsSchema,
  MovieSchema,
  MovieSearchResponseSchema,
} from "@/domain/entities/Movie";
import type { Movie, MovieDetails, MovieSearchResponse } from "@/domain/entities/Movie";

/**
 * Zod schemas for API validation
 * These validate the raw API response before transformation
 */
const APIMovieSchema = z.object({
  id: z.string(),
  primaryTitle: z.string(),
  type: z.string(),
  rating: z
    .object({
      aggregateRating: z.number(),
      voteCount: z.number(),
    })
    .optional(),
  startYear: z.number().optional(),
  primaryImage: z
    .object({
      url: z.string(),
      width: z.number().optional(),
      height: z.number().optional(),
      type: z.string().optional(),
    })
    .optional(),
  originalTitle: z.string().optional(),
  genres: z.array(z.string()).optional(),
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
});

const APIResponseSchema = z.object({
  titles: z.array(APIMovieSchema),
});

const APIPrecisionDateSchema = z.object({
  year: z.number().int().optional(),
  month: z.number().int().optional(),
  day: z.number().int().optional(),
});

const APINameSchema = z.object({
  displayName: z.string(),
});

const APITitleDetailsSchema = APIMovieSchema.extend({
  stars: z.array(APINameSchema).optional(),
});

const APIReleaseDatesResponseSchema = z.object({
  releaseDates: z
    .array(
      z.object({
        releaseDate: APIPrecisionDateSchema.optional(),
        country: z
          .object({
            code: z.string(),
            name: z.string(),
          })
          .optional(),
      })
    )
    .optional(),
  nextPageToken: z.string().optional(),
});

const APIEpisodeSchema = z.object({
  season: z.string().optional(),
  episodeNumber: z.number().int().optional(),
  title: z.string().optional(),
  releaseDate: APIPrecisionDateSchema.optional(),
});

const APIEpisodesResponseSchema = z.object({
  episodes: z.array(APIEpisodeSchema).optional(),
  nextPageToken: z.string().optional(),
});

type APIReleaseDateEntry = NonNullable<z.infer<typeof APIReleaseDatesResponseSchema>["releaseDates"]>[number];

function formatPrecisionDate(date?: z.infer<typeof APIPrecisionDateSchema>): string | undefined {
  if (!date?.year) {
    return undefined;
  }

  if (!date.month) {
    return String(date.year);
  }

  if (!date.day) {
    return `${date.year}-${String(date.month).padStart(2, "0")}`;
  }

  return `${date.year}-${String(date.month).padStart(2, "0")}-${String(date.day).padStart(2, "0")}`;
}

function extractOptionalCast(rawData: unknown): string[] | undefined {
  const castCandidate = (rawData as { cast?: unknown })?.cast;
  const parsedCast = z.array(z.string()).safeParse(castCandidate);

  if (parsedCast.success) {
    const normalizedCast = parsedCast.data.map((name) => name.trim()).filter(Boolean);

    if (normalizedCast.length > 0) {
      return normalizedCast;
    }
  }

  const starsCandidate = (rawData as { stars?: unknown })?.stars;
  const parsedStars = z.array(APINameSchema).safeParse(starsCandidate);

  if (!parsedStars.success) {
    return undefined;
  }

  const normalizedStars = parsedStars.data
    .map((star) => star.displayName.trim())
    .filter(Boolean);

  return normalizedStars.length > 0 ? normalizedStars : undefined;
}

function normalizeCast(title: z.infer<typeof APITitleDetailsSchema>): string[] | undefined {
  const fromStars = title.stars?.map((star) => star.displayName.trim()).filter(Boolean);

  if (fromStars && fromStars.length > 0) {
    return fromStars;
  }

  return undefined;
}

function extractOptionalWhereToWatch(rawData: unknown): string[] | undefined {
  const whereToWatchCandidate = (rawData as { whereToWatch?: unknown })?.whereToWatch;
  const parsedWhereToWatch = z.array(z.string()).safeParse(whereToWatchCandidate);

  if (!parsedWhereToWatch.success) {
    return undefined;
  }

  const normalizedWhereToWatch = parsedWhereToWatch.data
    .map((provider) => provider.trim())
    .filter(Boolean);

  return normalizedWhereToWatch.length > 0 ? normalizedWhereToWatch : undefined;
}

function isSeriesType(type: string): boolean {
  const normalized = type.toLowerCase();
  return normalized.includes("tv") || normalized.includes("series");
}

function normalizeImageType(type?: string):
  | "POSTER"
  | "STILL_FRAME"
  | "EVENT"
  | "BEHIND_THE_SCENES"
  | "PUBLICITY"
  | "PRODUCTION_ART"
  | undefined {
  if (!type) {
    return undefined;
  }

  const normalized = type.toUpperCase();
  const allowedTypes = new Set([
    "POSTER",
    "STILL_FRAME",
    "EVENT",
    "BEHIND_THE_SCENES",
    "PUBLICITY",
    "PRODUCTION_ART",
  ]);

  if (!allowedTypes.has(normalized)) {
    return undefined;
  }

  return normalized as
    | "POSTER"
    | "STILL_FRAME"
    | "EVENT"
    | "BEHIND_THE_SCENES"
    | "PUBLICITY"
    | "PRODUCTION_ART";
}

/**
 * API implementation of IMovieRepository
 * Validates all responses with Zod schemas
 */
export class APIMovieRepository implements IMovieRepository {
  private readonly baseUrl: string;

  private async fetchOptional<T>(
    path: string,
    schema: z.ZodType<T>
  ): Promise<T | undefined> {
    try {
      const url = new URL(`${this.baseUrl}${path}`);
      const res = await fetch(url);

      if (!res.ok) {
        return undefined;
      }

      const data: unknown = await res.json();
      const parsed = schema.safeParse(data);

      if (!parsed.success) {
        return undefined;
      }

      return parsed.data;
    } catch {
      return undefined;
    }
  }

  private async fetchAllReleaseDates(
    id: string
  ): Promise<APIReleaseDateEntry[]> {
    const releaseDates: APIReleaseDateEntry[] = [];
    let pageToken: string | undefined;

    do {
      const query = pageToken
        ? `?pageToken=${encodeURIComponent(pageToken)}`
        : "";

      const page = await this.fetchOptional(
        `/titles/${id}/releaseDates${query}`,
        APIReleaseDatesResponseSchema
      );

      if (!page) {
        break;
      }

      page.releaseDates?.forEach((entry) => {
        releaseDates.push(entry);
      });

      pageToken = page.nextPageToken;
    } while (pageToken);

    return releaseDates;
  }

  private async fetchAllEpisodes(
    id: string
  ): Promise<z.infer<typeof APIEpisodeSchema>[]> {
    const episodes: z.infer<typeof APIEpisodeSchema>[] = [];
    let pageToken: string | undefined;

    do {
      const query = pageToken
        ? `?pageToken=${encodeURIComponent(pageToken)}`
        : "";

      const page = await this.fetchOptional(
        `/titles/${id}/episodes${query}`,
        APIEpisodesResponseSchema
      );

      if (!page) {
        break;
      }

      if (page.episodes) {
        episodes.push(...page.episodes);
      }

      pageToken = page.nextPageToken;
    } while (pageToken);

    return episodes;
  }

  constructor() {
    this.baseUrl = process.env.EXPO_PUBLIC_API_URL || "";

    if (!this.baseUrl) {
      console.warn("EXPO_PUBLIC_API_URL not set, API calls will fail");
    }
  }

  async search(query: string): Promise<MovieSearchResponse> {
    if (!this.baseUrl) {
      throw new Error("API URL not configured");
    }

    const url = new URL(`${this.baseUrl}/search/titles`);
    url.searchParams.append("query", query);

    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data: unknown = await res.json();

    // Validate raw API response
    const parsed = APIResponseSchema.safeParse(data);

    if (!parsed.success) {
      console.error("API response validation failed:", parsed.error);
      throw new Error("Invalid API response format");
    }

    // Transform to domain model and validate
    const movies: Movie[] = parsed.data.titles.map((title) =>
      MovieSchema.parse({
        ...title,
        // Ensure required fields
        originalTitle: title.originalTitle || title.primaryTitle,
      })
    );

    return MovieSearchResponseSchema.parse({ titles: movies });
  }

  async getRandom(): Promise<MovieSearchResponse> {
    const movieTitles = movieTitlesSeed
      .trim()
      .split(",")
      .map((title) => title.trim())
      .filter(Boolean);

    if (movieTitles.length === 0) {
      throw new Error("No movie titles available");
    }

    const randomMovie =
      movieTitles[Math.floor(Math.random() * movieTitles.length)];

    return this.search(randomMovie);
  }

  async getById(id: string): Promise<MovieDetails | null> {
    if (!this.baseUrl) {
      throw new Error("API URL not configured");
    }

    const url = new URL(`${this.baseUrl}/titles/${id}`);
    const res = await fetch(url);

    if (res.status === 404) {
      return null;
    }

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data: unknown = await res.json();

    const parsedTitle = APITitleDetailsSchema.safeParse(data);

    if (!parsedTitle.success) {
      console.error("Movie validation failed:", parsedTitle.error);
      throw new Error("Invalid movie data from API");
    }

    const title = parsedTitle.data;
    const isSeries = isSeriesType(title.type);

    const [releaseDates, episodesList] = await Promise.all([
      this.fetchAllReleaseDates(id),
      isSeries ? this.fetchAllEpisodes(id) : Promise.resolve([]),
    ]);

    const releaseDateFromList = releaseDates
      .map((value) => formatPrecisionDate(value.releaseDate))
      .find(Boolean);

    const whereToWatch = extractOptionalWhereToWatch(data) || ["No disponible"];

    const releaseDate = releaseDateFromList || title.startYear?.toString() || "No disponible";

    const seasonsByNumber = new Map<
      number,
      { seasonNumber: number; episodes: { episodeNumber: number; title: string; releaseDate: string }[] }
    >();

    episodesList.forEach((episode, index) => {
      const seasonNumber = Number.parseInt(episode.season ?? "", 10);

      if (!Number.isFinite(seasonNumber)) {
        return;
      }

      const normalizedReleaseDate = formatPrecisionDate(episode.releaseDate);

      if (!normalizedReleaseDate) {
        return;
      }

      const existingSeason = seasonsByNumber.get(seasonNumber) || {
        seasonNumber,
        episodes: [],
      };

      existingSeason.episodes.push({
        episodeNumber: episode.episodeNumber ?? index + 1,
        title: episode.title || `Episodio ${episode.episodeNumber ?? index + 1}`,
        releaseDate: normalizedReleaseDate,
      });

      seasonsByNumber.set(seasonNumber, existingSeason);
    });

    const mappedSeasons =
      seasonsByNumber.size > 0
        ? Array.from(seasonsByNumber.values()).sort(
            (a, b) => a.seasonNumber - b.seasonNumber
          )
        : undefined;

    const moviePayload: MovieDetails = {
      id: title.id,
      type: title.type,
      primaryTitle: title.primaryTitle,
      originalTitle: title.originalTitle || title.primaryTitle,
      primaryImage: title.primaryImage
        ? {
            url: title.primaryImage.url,
            width: title.primaryImage.width,
            height: title.primaryImage.height,
            type: normalizeImageType(title.primaryImage.type),
          }
        : undefined,
      genres: title.genres,
      startYear: title.startYear,
      endYear: title.endYear,
      runtimeSeconds: title.runtimeSeconds,
      plot: title.plot || "No disponible",
      cast: normalizeCast(title) || extractOptionalCast(data) || ["No disponible"],
      releaseDate,
      whereToWatch,
      seasons: mappedSeasons,
      isAdult: title.isAdult,
      originCountries: title.originCountries,
      spokenLanguages: title.spokenLanguages,
      rating: title.rating,
    };

    const parsed = MovieDetailsSchema.safeParse(moviePayload);

    if (!parsed.success) {
      console.error("Movie validation failed:", parsed.error);
      throw new Error("Invalid movie data from API");
    }

    return parsed.data;
  }
}
