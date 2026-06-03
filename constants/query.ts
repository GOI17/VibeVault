import type { MediaType } from "@/domain/entities/Favorite";

// Re-export types for backward compatibility
export type { Favorite, FavoriteInput, MediaType } from "@/domain/entities/Favorite";
export type { Movie, MovieSearchResponse } from "@/domain/entities/Movie";

type MoviesAllQuery = {
  queryKey: ["movies", "all", string];
};

type MoviesSuggestionsQuery = {
  queryKey: ["movies", "suggestions", string];
};

type FavoritesByMediaTypeQuery = {
  queryKey: ["movies", "favorites", MediaType | "all"];
};

type WatchedMovieQuery = {
  queryKey: ["watched-progress", "movie", string];
};

type WatchedEpisodesQuery = {
  queryKey: ["watched-progress", "episodes", string];
};

export const queryOptions = {
  movies: {
    all: (query: string): MoviesAllQuery => {
      return {
        queryKey: ["movies", "all", query],
      };
    },
    suggestions: (query: string): MoviesSuggestionsQuery => {
      return {
        queryKey: ["movies", "suggestions", query],
      };
    },
    random: {
      queryKey: ["movies", "random"],
    },
    favorites: {
      queryKey: ["movies", "favorites"],
    },
    favoritesByMediaType: (mediaType: MediaType | undefined): FavoritesByMediaTypeQuery => {
      return {
        queryKey: ["movies", "favorites", mediaType ?? "all"],
      };
    },
  },
  watchedProgress: {
    movie: (mediaId: string): WatchedMovieQuery => {
      return {
        queryKey: ["watched-progress", "movie", mediaId],
      };
    },
    episodes: (mediaId: string): WatchedEpisodesQuery => {
      return {
        queryKey: ["watched-progress", "episodes", mediaId],
      };
    },
  },
  cookies: {
    theme: {
      get: {
        queryKey: ["cookies", "theme"],
      },
      set: {
        queryKey: ["cookies", "theme", "set"],
      },
    },
    layout: {
      get: {
        queryKey: ["cookies", "layout"],
      },
      set: {
        queryKey: ["cookies", "layout", "set"],
      },
    },
  },
};
