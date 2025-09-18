import AsyncStorage from "@react-native-async-storage/async-storage";
import { z } from "zod";

interface Movie {
  id: string;
  type: string;
  primaryTitle: string;
  originalTitle: string;
  primaryImage: {
    url: string;
    width: number;
    height: number;
    type:
      | "POSTER"
      | "STILL_FRAME"
      | "EVENT"
      | "BEHIND_THE_SCENES"
      | "PUBLICITY"
      | "PRODUCTION_ART";
  };
  genres: string[];
  startYear: number;
  endYear: number;
  runtimeSeconds: number;
  plot: string;
  isAdult: boolean;
  originCountries: {
    code: string;
    name: string;
  }[];
  spokenLanguages: {
    code: string;
    name: string;
  }[];
  rating: {
    aggregateRating: number;
    voteCount: number;
  };
}

type FavoriteMovie = Pick<Movie, "id" | "primaryTitle"> &
  Pick<Movie["primaryImage"], "url">;

const MovieSchema = z.object({
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
      width: z.number(),
      height: z.number(),
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
      }),
    )
    .optional(),
  spokenLanguages: z
    .array(
      z.object({
        code: z.string(),
        name: z.string(),
      }),
    )
    .optional(),
});

const getAllMovies = async (query: string) => {
  const url = new URL(`${process.env.EXPO_PUBLIC_API_URL}/search/titles`);
  url.searchParams.append("query", query);
  const res = await fetch(url).then((res) => {
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    return res.json();
  });
  const movies = z.safeParse(
    z.object({ titles: z.array(MovieSchema) }).optional(),
    res,
  );
  if (movies.error) {
    console.error(movies.error);
    throw new Error("Failed to fetch movies");
  }

  return movies.data;
};

const getRandomMovies = async () => {
  const movieTitles = await import("@/constants/movieTitles").then(
    ({ movieTitles }) => movieTitles.trim().split(","),
  );
  const moviesCount = movieTitles.length;
  const randomMovie = movieTitles[Math.floor(Math.random() * moviesCount)];
  const movies = await getAllMovies(randomMovie);
  return movies;
};

const saveMovieToFavorites = async (movie: FavoriteMovie) => {
  const storage = await AsyncStorage.getItem("favorite_movies");
  if (!storage) {
    return AsyncStorage.setItem(
      "favorite_movies",
      `[${JSON.stringify(movie)}]`,
    );
  }

  const favorites = JSON.parse(storage) as FavoriteMovie[];
  if (favorites.find((_movie: FavoriteMovie) => _movie.id === movie.id)) {
    return;
  }

  favorites.push(movie);

  return AsyncStorage.setItem("favorite_movies", JSON.stringify(favorites));
};

const removeFromFavorites = async (movieId: FavoriteMovie["id"]) => {
  const storage = await AsyncStorage.getItem("favorite_movies");
  if (!storage) {
    return;
  }

  const favorites = JSON.parse(storage) as FavoriteMovie[];
  const updatedFavorites = favorites.filter(
    (favorite) => favorite.id !== movieId,
  );

  return AsyncStorage.setItem(
    "favorite_movies",
    JSON.stringify(updatedFavorites),
  );
};

const getFavorites = async (by: "movies") => {
  const storageKey = `favorite_${by}`;
  const res = await AsyncStorage.getItem(storageKey);
  return res ? JSON.parse(res) as FavoriteMovie[] : [];
};

export const queryOptions = {
  movies: {
    all: (query: string) => {
      return {
        queryKey: ["movies", "all", query],
        queryFn: () => getAllMovies(query),
      };
    },
    random: {
      queryKey: ["movies", "random"],
      queryFn: () => getRandomMovies(),
    },
    markAsFavorite: {
      mutationFn: saveMovieToFavorites,
    },
    removeFromFavorites: {
      mutationFn: removeFromFavorites,
    },
    favorites: {
      queryKey: ["movies", "favorites"],
      queryFn: () => getFavorites("movies"),
    },
  },
  cookies: {
    theme: {
      get: {
        queryKey: ["cookies", "theme"],
        queryFn: () => AsyncStorage.getItem("theme"),
      },
      set: {
        mutationFn: (scheme: "light" | "dark") =>
          AsyncStorage.setItem("theme", scheme),
      },
    },
    layout: {
      get: {
        queryKey: ["cookies", "layout"],
        queryFn: () => AsyncStorage.getItem("layout"),
      },
      set: {
        mutationFn: (value: "grid" | "list") =>
          AsyncStorage.setItem("layout", value),
      },
    },
  },
};
