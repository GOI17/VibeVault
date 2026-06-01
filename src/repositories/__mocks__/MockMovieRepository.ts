import type { IMovieRepository } from "@/domain/repositories/IMovieRepository";
import type { MovieDetails, MovieSearchResponse, MovieSuggestion } from "@/domain/entities/Movie";

/**
 * Mock implementation of IMovieRepository for testing
 */
export class MockMovieRepository implements IMovieRepository {
  private mockData: MovieSearchResponse = { titles: [] };
  private suggestions: MovieSuggestion[] = [];
  private movieById: Map<string, MovieDetails> = new Map();

  setMockData(data: MovieSearchResponse): void {
    this.mockData = data;
  }

  setMockMovie(movie: MovieDetails): void {
    this.movieById.set(movie.id, movie);
  }

  setSuggestions(suggestions: MovieSuggestion[]): void {
    this.suggestions = suggestions;
  }

  async search(_query: string): Promise<MovieSearchResponse> {
    return this.mockData;
  }

  async suggest(_query: string): Promise<MovieSuggestion[]> {
    return this.suggestions;
  }

  async getRandom(): Promise<MovieSearchResponse> {
    return this.mockData;
  }

  async getById(id: string): Promise<MovieDetails | null> {
    return this.movieById.get(id) || null;
  }

  // Helper for testing
  reset(): void {
    this.mockData = { titles: [] };
    this.suggestions = [];
    this.movieById.clear();
  }
}
