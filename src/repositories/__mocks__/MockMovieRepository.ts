import type { IMovieRepository } from "@/domain/repositories/IMovieRepository";
import type { Movie, MovieSearchResponse } from "@/domain/entities/Movie";

/**
 * Mock implementation of IMovieRepository for testing
 */
export class MockMovieRepository implements IMovieRepository {
  private mockData: MovieSearchResponse = { titles: [] };
  private movieById: Map<string, Movie> = new Map();

  setMockData(data: MovieSearchResponse): void {
    this.mockData = data;
  }

  setMockMovie(movie: Movie): void {
    this.movieById.set(movie.id, movie);
  }

  async search(_query: string): Promise<MovieSearchResponse> {
    return this.mockData;
  }

  async getRandom(): Promise<MovieSearchResponse> {
    return this.mockData;
  }

  async getById(id: string): Promise<Movie | null> {
    return this.movieById.get(id) || null;
  }

  // Helper for testing
  reset(): void {
    this.mockData = { titles: [] };
    this.movieById.clear();
  }
}
