import { Movie, MovieSearchResponse } from "@/domain/entities/Movie";

/**
 * Repository interface for Movie operations
 * Abstracts the data source (TMDB API, local cache, etc.)
 */
export interface IMovieRepository {
  /**
   * Search for movies by query string
   * @param query Search query
   * @returns Search response with movies
   * @throws Error if API request fails
   */
  search(query: string): Promise<MovieSearchResponse>;

  /**
   * Get random movies
   * @returns Search response with random movies
   * @throws Error if API request fails
   */
  getRandom(): Promise<MovieSearchResponse>;

  /**
   * Get movie by ID
   * @param id Movie ID
   * @returns Movie or null if not found
   */
  getById(id: string): Promise<Movie | null>;
}
