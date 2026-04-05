import type { MediaType } from "@/domain/entities/Favorite";

// Re-export types for backward compatibility
export type { Favorite, FavoriteInput, MediaType } from "@/domain/entities/Favorite";
export type { Movie, MovieSearchResponse } from "@/domain/entities/Movie";

type MoviesAllQuery = {
  queryKey: ["movies", "all", string];
};

type FavoritesByMediaTypeQuery = {
  queryKey: ["movies", "favorites", MediaType | "all"];
};

export const queryOptions = {
  movies: {
    all: (query: string): MoviesAllQuery => {
      return {
        queryKey: ["movies", "all", query],
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
