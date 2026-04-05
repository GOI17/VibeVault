import { useQuery } from "@tanstack/react-query";
import { useMemo, useState, type ReactElement } from "react";

import { HomeView } from "@/components/views/HomeView";
import { queryOptions } from "@/constants/query";
import { useFavoriteMutations } from "@/hooks/useFavoriteMutations";
import { useRepositories } from "@/providers/RepositoryProvider";

export function HomeContainer(): ReactElement {
  const { movieRepository, favoriteRepository } = useRepositories();
  const { data, isLoading, error } = useQuery({
    ...queryOptions.movies.random,
    queryFn: () => movieRepository.getRandom(),
  });

  const { data: favorites } = useQuery({
    ...queryOptions.movies.favorites,
    queryFn: () => favoriteRepository.getAll(),
  });

  const [recentlyAddedIds, setRecentlyAddedIds] = useState<Set<string>>(new Set());
  const { addFavorite, removeFavorite } = useFavoriteMutations(
    (movieId) => setRecentlyAddedIds((prev) => new Set(prev).add(movieId)),
    (movieId) =>
      setRecentlyAddedIds((prev) => {
        const next = new Set(prev);
        next.delete(movieId);
        return next;
      }),
  );

  const movies = useMemo(
    () =>
      data?.titles?.map((item) => ({
        key: item.id,
        imageSrc: item.primaryImage?.url,
        title: item.primaryTitle,
        mediaType: (item.type?.toLowerCase().includes("tv") ? "series" : "movie") as "movie" | "series",
      })) || [],
    [data?.titles],
  );

  const favoriteIds = useMemo(() => new Set(favorites?.map((item) => item.id) ?? []), [favorites]);

  return (
    <HomeView
      isLoading={isLoading}
      errorMessage={error?.message}
      movies={movies}
      favoriteIds={favoriteIds}
      recentlyAddedIds={recentlyAddedIds}
      onAddFavorite={(item) =>
        addFavorite({
          id: item.key,
          title: item.title,
          mediaType: item.mediaType || "movie",
          url: item.imageSrc,
        })
      }
      onRemoveFavorite={(item) => removeFavorite(item.key)}
    />
  );
}
