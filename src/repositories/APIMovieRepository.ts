import { z } from "zod";
import type { IMovieRepository } from "@/domain/repositories/IMovieRepository";
import {
  MovieSchema,
  MovieSearchResponseSchema,
} from "@/domain/entities/Movie";
import type { Movie, MovieSearchResponse } from "@/domain/entities/Movie";

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

/**
 * API implementation of IMovieRepository
 * Validates all responses with Zod schemas
 */
export class APIMovieRepository implements IMovieRepository {
  private readonly baseUrl: string;

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

    const data = await res.json();

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
    let movieTitles: string[] = [];

    try {
      const { movieTitles: titles } = require("@/constants/movieTitles");
      movieTitles = titles.trim().split(",");
    } catch {
      throw new Error("Failed to load movie titles for random selection");
    }

    if (movieTitles.length === 0) {
      throw new Error("No movie titles available");
    }

    const randomMovie =
      movieTitles[Math.floor(Math.random() * movieTitles.length)];

    return this.search(randomMovie);
  }

  async getById(id: string): Promise<Movie | null> {
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

    const data = await res.json();

    // Validate with Zod
    const parsed = MovieSchema.safeParse(data);

    if (!parsed.success) {
      console.error("Movie validation failed:", parsed.error);
      throw new Error("Invalid movie data from API");
    }

    return parsed.data;
  }
}
