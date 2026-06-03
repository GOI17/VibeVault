import { useQuery } from "@tanstack/react-query";
import { useNavigation, type NavigationProp } from "@react-navigation/native";
import { useEffect, useMemo, useState, type ReactElement } from "react";

import type { RootStackParamList } from "@/app/navigation/types";
import { SearchView } from "@/components/views/SearchView";
import { queryOptions } from "@/constants/query";
import { inferMovieMediaType } from "@/domain/entities/Movie";
import { useFavoriteMutations } from "@/hooks/useFavoriteMutations";
import { useRepositories } from "@/providers/RepositoryProvider";
import { getWatchStatusByMediaId } from "./watchStatusViewModel";

interface SearchContainerProps {
  query: string;
}

export function SearchContainer({ query }: SearchContainerProps): ReactElement {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { movieRepository, favoriteRepository, watchedProgressRepository } = useRepositories();
  const { addFavorite, removeFavorite } = useFavoriteMutations();
  const [activeQuery, setActiveQuery] = useState(query);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    setActiveQuery(query);
    setRetryCount(0);
  }, [query]);

  const { data, isFetching, isLoading, error, refetch } = useQuery({
    ...queryOptions.movies.all(activeQuery),
    queryFn: () => movieRepository.search(activeQuery),
    retry: false,
  });

  const handleRetrySearch = (): void => {
    if (retryCount >= 3) {
      return;
    }

    void (async (): Promise<void> => {
      const result = await refetch();

      if (result.error) {
        setRetryCount((currentCount) => Math.min(currentCount + 1, 3));
        return;
      }

      setRetryCount(0);
    })();
  };

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
        mediaType: inferMovieMediaType(item.type),
        description: item.plot,
        cast: item.cast,
        releaseDate: item.releaseDate || item.startYear?.toString(),
        whereToWatch: item.whereToWatch,
        seasons: item.seasons,
      })) || [];
  const { data: watchStatusByMediaId = {} } = useQuery({
    queryKey: ["watched-progress", "summary", mappedData.map((item) => item.key).sort()],
    queryFn: () => getWatchStatusByMediaId(mappedData, watchedProgressRepository),
    enabled: mappedData.length > 0,
  });
  const dataWithWatchStatus = mappedData.map((item) => ({
    ...item,
    ...watchStatusByMediaId[item.key],
  }));

  return (
    <SearchView
      query={activeQuery}
      isLoading={isLoading}
      errorMessage={error?.message}
      retryCount={retryCount}
      maxRetries={3}
      isRetrying={isFetching && Boolean(error)}
      data={dataWithWatchStatus}
      favoriteIds={favoriteIds}
      onRetrySearch={handleRetrySearch}
      onGoHome={() => navigation.navigate("Tabs", { screen: "Home" })}
      onAddFavorite={(item) =>
        addFavorite({
          id: item.key,
          title: item.title,
          mediaType: item.mediaType || "movie",
          url: item.imageSrc,
          description: item.description || "Not available",
          cast: item.cast && item.cast.length > 0 ? item.cast : ["Not available"],
          releaseDate: item.releaseDate || "Not available",
          whereToWatch:
            item.whereToWatch && item.whereToWatch.length > 0
              ? item.whereToWatch
              : ["Not available"],
          seasons: item.seasons,
          source: "catalog",
        })
      }
      onRemoveFavorite={(item) => removeFavorite(item.key)}
      onOpenDetails={(item) =>
        navigation.navigate("Details", {
          id: item.key,
          title: item.title,
          mediaType: item.mediaType || "movie",
          imageSrc: item.imageSrc,
          description: item.description,
          cast: item.cast,
          releaseDate: item.releaseDate,
          whereToWatch: item.whereToWatch,
          seasons: item.seasons,
          source: "catalog",
        })
      }
    />
  );
}
