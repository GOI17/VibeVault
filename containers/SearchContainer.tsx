import { useQuery } from "@tanstack/react-query";
import { useMemo, useState, type ReactElement } from "react";

import { SearchView } from "@/components/views/SearchView";
import { queryOptions } from "@/constants/query";
import { useFavoriteMutations } from "@/hooks/useFavoriteMutations";
import { useRepositories } from "@/providers/RepositoryProvider";

interface SearchContainerProps {
  query: string;
}

export function SearchContainer({ query }: SearchContainerProps): ReactElement {
  const { movieRepository, favoriteRepository } = useRepositories();
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

  const { data, isLoading, error } = useQuery({
    ...queryOptions.movies.all(query),
    queryFn: () => movieRepository.search(query),
  });

  const { data: favorites } = useQuery({
    ...queryOptions.movies.favorites,
    queryFn: () => favoriteRepository.getAll(),
  });

  const favoriteIds = useMemo(() => new Set(favorites?.map((item) => item.id) ?? []), [favorites]);
  const mappedData =
    data?.titles?.map((item) => ({
      key: item.id,
      imageSrc: item.primaryImage?.url,
      title: item.primaryTitle,
      mediaType: (item.type?.toLowerCase().includes("tv") ? "series" : "movie") as "movie" | "series",
    })) || [];

  return (
    <SearchView
      query={query}
      isLoading={isLoading}
      errorMessage={error?.message}
      data={mappedData}
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
